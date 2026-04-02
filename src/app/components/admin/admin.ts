import { Component, effect, inject, signal } from '@angular/core';

import { Button } from '../ui-elements/button/button';
import { ApiService } from '../../services/api';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TextField } from '../ui-elements/text-field/text-field';
import { th } from 'zod/v4/locales';

@Component({
  selector: 'vai-admin',
  imports: [Button, TextField, ReactiveFormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin {
  readonly #apiService = inject(ApiService);

  protected readonly showConfirmReset = signal<boolean>(false);

  protected keywordsFormControl = new FormControl('');

  protected async generatePoem(): Promise<void> {
    const wordsIncluded = this.keywordsFormControl.value?.split(',').map((word) => word.trim());

    const success = await this.#apiService.generatePoem(wordsIncluded ?? []);

    if (success) {
      this.keywordsFormControl.reset();
    }
  }

  protected clearAllData() {
    void this.#apiService.clearAllData();
  }
}
