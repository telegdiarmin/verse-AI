import { Injectable } from '@angular/core';
import { NotificationService } from './notification';
import { TokenService } from './token';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(
    private readonly _notificationservice: NotificationService,
    private readonly _tokenService: TokenService,
  ) {}

  public generatePoem(): void {
    // TODO: just a simulation, add real API call
    this._notificationservice.showNotification('loading', 'Generálás folyamatban...');

    setTimeout(() => this._notificationservice.showNotification('success', 'Sikeres generálás!'), 4000);
  }

  public clearAllData(): void {
    // TODO: implement
  }

  public registerUser(userName: string): void {
    // TODO: just a simulation, add real API call
    this._notificationservice.showNotification('loading', 'Regisztráció folyamatban...');

    setTimeout(() => {
      this._notificationservice.showNotification('success', 'Sikeres regisztráció!');
      this._tokenService.setUserToken(userName);
    }, 4000);
  }

  public fetchData(): void {
    // TODO: implement
  }
}
