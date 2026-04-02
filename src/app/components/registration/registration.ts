import { Component, effect, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { routeVerse } from '../../app.routes';
import { TokenService } from '../../services/token';
import { Button } from '../ui-elements/button/button';
import { TextField } from '../ui-elements/text-field/text-field';
import { ApiService } from '../../services/api';

@Component({
  selector: 'vai-registration',
  imports: [Button, TextField, ReactiveFormsModule],
  templateUrl: './registration.html',
  styleUrl: './registration.css',
})
export class Registration {
  readonly #router = inject(Router);
  readonly #apiService = inject(ApiService);
  readonly #tokenService = inject(TokenService);

  protected userNameFormControl = new FormControl('', {
    validators: [Validators.required, Validators.minLength(3)],
  });

  constructor() {
    effect(() => {
      if (!!this.#tokenService.userToken()) {
        this.#router.navigate([`/${routeVerse}`]);
      }
    });
  }

  protected onRegister(): void {
    this.#apiService.registerUser(this.userNameFormControl.value ?? '');
  }
}
