import { Component, signal } from '@angular/core';

import { Button } from '../ui-elements/button/button';
import { VerseContainer } from '../ui-elements/verse-container/verse-container';

@Component({
  selector: 'vai-verse',
  imports: [Button, VerseContainer],
  templateUrl: './verse.html',
  styleUrl: './verse.css',
})
export class Verse {
  protected readonly rowNumber = signal<number>(7);

  protected readonly rowText = signal<string>('Zöld erdőben jártam én ma,');
}
