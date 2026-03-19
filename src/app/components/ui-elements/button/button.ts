import { Component, input, output, signal } from '@angular/core';

@Component({
  selector: 'vai-button',
  templateUrl: './button.html',
  styleUrl: './button.css',
})
export class Button {
  public readonly destructive = input<boolean>(false);

  public readonly disabled = input<boolean>(false);

  public readonly label = input.required<string>();

  public readonly onClick = output<void>();
}
