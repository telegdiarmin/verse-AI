import { inject, Injectable, signal } from '@angular/core';
import { NotificationService } from './notification';
import { TokenService } from './token';
import z from 'zod';
import { RegisterUserHandlerResponseType } from '../../types/register-user-handler.types';
import { FetchDataHandlerResponseType } from '../../types/fetch-data-handler.types';
import { GeneratePoemHandlerResponseType } from '../../types/generate-poem-handler.types';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  readonly #notificationservice = inject(NotificationService);
  readonly #tokenService = inject(TokenService);

  #loggedInUser = signal<string | undefined>(undefined);

  public loggedInUser = this.#loggedInUser.asReadonly();

  #registeredUsers = signal<string[]>([]);

  public registeredUsers = this.#registeredUsers.asReadonly();

  #currentVerse = signal<string>('');

  public currentVerse = this.#currentVerse.asReadonly();

  #currentOrdinal = signal<number | undefined>(undefined);

  public currentOrdinal = this.#currentOrdinal.asReadonly();

  public async generatePoem(keywords: string[]): Promise<boolean> {
    const token = this.#tokenService.userToken();

    this.#notificationservice.showNotification('loading', 'Generálás folyamatban...');

    try {
      const response: Response = await fetch('/.netlify/functions/generate-poem-handler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: token, keywords }),
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.error);
      }

      const { verseData }: GeneratePoemHandlerResponseType = await response.json();

      this.#updateVerseData(verseData?.verse, verseData?.ordinal);
      this.#notificationservice.showNotification('success', 'Generálás sikeres.');

      return true;
    } catch (error) {
      const errorText = error instanceof Error ? error.message : 'Ismeretlen hiba';
      this.#notificationservice.showNotification('error', `Generálás sikertelen: ${errorText}`);
    }

    return false;
  }

  public async clearAllData(): Promise<boolean> {
    const token = this.#tokenService.userToken();

    this.#notificationservice.showNotification('loading', 'Adatok törlése folyamatban...');

    try {
      const response: Response = await fetch('/.netlify/functions/reset-handler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: token }),
      });

      if (!response.ok) {
        throw new Error();
      }

      this.#udpateData();
      this.#updateVerseData();

      this.#notificationservice.showNotification('success', 'Adatok törlése sikeres.');

      return true;
    } catch {
      this.#notificationservice.showNotification('error', 'Adatok törlése sikertelen.');
    }

    return false;
  }

  public async registerUser(userName: string): Promise<boolean> {
    this.#notificationservice.showNotification('loading', 'Regisztráció folyamatban...');

    try {
      const response: Response = await fetch('/.netlify/functions/register-user-handler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: userName }),
      });

      if (!response.ok) {
        throw new Error();
      }

      const { userData }: RegisterUserHandlerResponseType = await response.json();

      this.#udpateData(userData.userId, userData.name);

      this.#notificationservice.showNotification('success', 'Sikeres regisztráció.');

      return true;
    } catch {
      this.#notificationservice.showNotification('error', 'Regisztráció sikertelen.');
    }

    return false;
  }

  public async fetchData(): Promise<boolean> {
    const token = this.#tokenService.userToken();

    try {
      const response: Response = await fetch('/.netlify/functions/fetch-data-handler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: token }),
      });

      const { userData, registeredUsers, verseData }: FetchDataHandlerResponseType =
        await response.json();

      this.#udpateData(userData?.userId, userData?.name, registeredUsers);
      this.#updateVerseData(verseData?.verse, verseData?.ordinal);

      return true;
    } catch {
      return false;
    }
  }

  #udpateData(userId?: string, name?: string, registeredUsers: string[] = []) {
    this.#tokenService.setUserToken(userId);
    this.#loggedInUser.set(name);
    this.#registeredUsers.set(registeredUsers);
  }

  #updateVerseData(verse: string = '', ordinal?: number) {
    this.#currentOrdinal.set(ordinal);
    this.#currentVerse.set(verse);
  }
}
