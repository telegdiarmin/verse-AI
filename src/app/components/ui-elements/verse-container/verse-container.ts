import { Component, input } from '@angular/core';

@Component({
  selector: 'vai-verse-container',
  imports: [],
  templateUrl: './verse-container.html',
  styleUrl: './verse-container.css',
})
export class VerseContainer {
  public readonly rowNumber = input.required<number>();

  public readonly rowText = input.required<string>();
}
