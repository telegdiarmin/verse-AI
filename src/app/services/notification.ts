import { Injectable, signal } from '@angular/core';

export type NotificationType = 'loading' | 'error' | 'success';

export interface NotificationConfig {
  notificationType: NotificationType;
  message: string;
}

const messageTimeout = 3000;

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  #currentNotification = signal<NotificationConfig | null>(null);

  public currentNotification = this.#currentNotification.asReadonly();

  #timeoutRef: number = -1;

  public showNotification(notificationType: NotificationType, message: string): void {
    clearTimeout(this.#timeoutRef);

    this.#currentNotification.set({ notificationType, message });

    if (notificationType !== 'loading') {
      this.#timeoutRef = setTimeout(() => this.discardNotification(), messageTimeout);
    }
  }

  public discardNotification(): void {
    if (this.#currentNotification()?.notificationType !== 'loading') {
      this.#currentNotification.set(null);
    }
  }
}
