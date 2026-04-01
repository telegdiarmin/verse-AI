import { Component, inject, signal } from '@angular/core';

import { Button } from '../ui-elements/button/button';
import { VerseContainer } from '../ui-elements/verse-container/verse-container';
import { ApiService } from '../../services/api';

@Component({
  selector: 'vai-verse',
  imports: [Button, VerseContainer],
  templateUrl: './verse.html',
  styleUrl: './verse.css',
})
export class Verse {
  protected readonly apiService = inject(ApiService);

  protected readonly rowNumber = signal<number>(7);

  protected readonly rowText = signal<string>('Zöld erdőben jártam én ma,');

  protected refresh() {
    this.apiService.fetchData();
  }
}
