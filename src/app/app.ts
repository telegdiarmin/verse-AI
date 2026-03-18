import { Component, signal } from '@angular/core';
import { provideRouter, RouterOutlet } from '@angular/router';
import { routes } from './app.routes';

@Component({
  selector: 'vai-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('verse-AI');
}
