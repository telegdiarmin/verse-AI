import { Component, input, output } from '@angular/core';
import { NotificationType } from '../../../services/notification';

@Component({
  selector: 'vai-snackbar',
  imports: [],
  templateUrl: './snackbar.html',
  styleUrl: './snackbar.css',
})
export class Snackbar {
  public message = input.required<string>();

  public notificationType = input.required<NotificationType>();

  public discard = output<void>();
}
