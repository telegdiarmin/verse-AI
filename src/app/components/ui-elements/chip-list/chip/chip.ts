import { Component, input } from '@angular/core';

@Component({
  selector: 'vai-chip',
  imports: [],
  templateUrl: './chip.html',
  styleUrl: './chip.css',
})
export class Chip {
  public readonly item = input<string>();
}
