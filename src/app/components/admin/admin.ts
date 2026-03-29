import { Component, signal } from '@angular/core';

import { Button } from '../ui-elements/button/button';
import { NotificationService } from '../../services/notification';
import { ApiService } from '../../services/api';

@Component({
  selector: 'vai-admin',
  imports: [Button],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin {
  protected readonly showConfirmReset = signal<boolean>(false);

  constructor(private readonly _apiService: ApiService) {}

  protected generatePoem(): void {
    this._apiService.generatePoem();
  }

  protected clearAllData() {
    this._apiService.clearAllData();
  }
}
