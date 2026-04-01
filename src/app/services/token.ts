import { DOCUMENT } from '@angular/common';
import { inject, Injectable, signal } from '@angular/core';

const TOKEN_KEY = 'vai-user-token';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  readonly #localStorage = inject(DOCUMENT)?.defaultView?.localStorage;

  #userToken = signal<string>('');

  public userToken = this.#userToken.asReadonly();

  constructor() {
    const token = this.#localStorage?.getItem(TOKEN_KEY) || '';

    this.#userToken.set(token);
  }

  setUserToken(token?: string): void {
    this.#userToken.set(token ?? '');

    if (token) {
      this.#localStorage?.setItem(TOKEN_KEY, token);
    } else {
      this.#localStorage?.removeItem(TOKEN_KEY);
    }
  }
}
