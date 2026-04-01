import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';

import { ChipList } from './components/ui-elements/chip-list/chip-list';
import { Snackbar } from './components/ui-elements/snackbar/snackbar';
import { ApiService } from './services/api';
import { NotificationService } from './services/notification';
import { TokenService } from './services/token';
import { routeRegistration } from './app.routes';

@Component({
  selector: 'vai-root',
  imports: [RouterOutlet, ChipList, Snackbar],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  readonly #router = inject(Router);
  readonly #tokenService = inject(TokenService);
  protected readonly apiService = inject(ApiService);
  protected readonly notificationService = inject(NotificationService);

  protected readonly title = signal('verse-AI');

  constructor() {
    effect(() => {
      if (!this.#tokenService.userToken()) {
        this.#router.navigate([`/${routeRegistration}`]);
      }
    });
  }

  public ngOnInit(): void {
    this.#router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.apiService.fetchData();
      }
    });
  }
}
