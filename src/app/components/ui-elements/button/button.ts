import { Component, input, output, signal } from '@angular/core';

@Component({
  selector: 'vai-button',
  templateUrl: './button.html',
  styleUrl: './button.css',
})
export class Button {
  public readonly disabled = input<boolean>(false);

  public readonly stroked = input<boolean>(false);

  public readonly label = input<string>('');

  public readonly onClick = output<void>();
}
