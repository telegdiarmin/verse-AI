import { Component, effect, inject, OnInit, signal } from '@angular/core';

import { Button } from '../ui-elements/button/button';
import { ApiService } from '../../services/api';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TextField } from '../ui-elements/text-field/text-field';
import { th } from 'zod/v4/locales';
import { Router } from '@angular/router';
import { routeVerse } from '../../app.routes';

@Component({
  selector: 'vai-admin',
  imports: [Button, TextField, ReactiveFormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin implements OnInit {
  readonly #apiService = inject(ApiService);
  readonly #router = inject(Router);

  protected readonly showConfirmReset = signal<boolean>(false);

  protected keywordsFormControl = new FormControl('');

  public ngOnInit(): void {
    this.keywordsFormControl.valueChanges.subscribe((value) =>
      this.keywordsFormControl.setValue(this.#normalize(value || ''), { emitEvent: false }),
    );
  }

  protected onKeyDown(event: KeyboardEvent) {
    const allowedKeys = ['Backspace', 'ArrowLeft', 'ArrowRight', 'Delete', ' '];

    if (allowedKeys.includes(event.key)) {
      return;
    }

    const regex = /^[a-zA-ZáéíóöőúüűÁÉÍÓÖŐÚÜ0-9]$/;

    if (!regex.test(event.key)) {
      event.preventDefault();
    }
  }

  protected async generatePoem(): Promise<void> {
    const wordsIncluded = this.keywordsFormControl.value
      ?.split(',')
      .map((word) => word.trim())
      .filter((word) => word.length);

    const success = await this.#apiService.generatePoem(wordsIncluded ?? []);

    if (success) {
      this.keywordsFormControl.reset();
      this.#router.navigate([`/${routeVerse}`]);
    }
  }

  protected clearAllData() {
    void this.#apiService.clearAllData();
  }

  #normalize(text: string) {
    return text
      .split(/[,\s]+/)
      .map((p) => p.replace(/\s+/g, ''))
      .filter((p) => p.length > 0)
      .join(', ');
  }
}
