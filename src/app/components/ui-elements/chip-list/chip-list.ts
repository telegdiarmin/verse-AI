import { Component, input } from '@angular/core';

import { Chip } from './chip/chip';

@Component({
  selector: 'vai-chip-list',
  imports: [Chip],
  templateUrl: './chip-list.html',
  styleUrl: './chip-list.css',
})
export class ChipList {
  public readonly items = input<string[]>([]);
}
