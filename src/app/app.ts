import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { ChipList } from './components/ui-elements/chip-list/chip-list';
import { NotificationService } from './services/notification';
import { Snackbar } from "./components/ui-elements/snackbar/snackbar";

@Component({
  selector: 'vai-root',
  imports: [RouterOutlet, ChipList, Snackbar],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('verse-AI');

  // TODO - remove this later
  protected readonly mockItems = [
    'Pigen',
    'Barnabás',
    'ZG',
    'Puli',
    'René',
    'Misi',
    'Peti',
    'Jecó',
    'Imi',
    'Máté',
    'Gazsi',
    'Levi',
    'Ármin',
    'Fábi',
    'Bande',
  ];

  protected readonly mockCurrentUser = 'Bande';

  constructor(protected readonly notificationService: NotificationService) {}
}
