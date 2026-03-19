import { Component, signal } from '@angular/core';
import { provideRouter, RouterOutlet } from '@angular/router';
import { routes } from './app.routes';
import { ChipList } from "./components/ui-elements/chip-list/chip-list";

@Component({
  selector: 'vai-root',
  imports: [RouterOutlet, ChipList],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('verse-AI');

  // TODO - remove this later
  protected readonly mockItems = ['Pigen', 'Barnabás', 'Fábi', 'Puli', 'René'];
  protected readonly mockCurrentUser = 'Bande';
}
