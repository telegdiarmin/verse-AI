import { Component, effect } from '@angular/core';
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
  protected userNameFormControl = new FormControl('', {
    validators: [Validators.required, Validators.minLength(3)],
  });

  constructor(
    private readonly _router: Router,
    private readonly _apiService: ApiService,
    private readonly _tokenService: TokenService,
  ) {
    effect(() => {
      if (!!this._tokenService.userToken()) {
        this._router.navigate([`/${routeVerse}`]);
      }
    });
  }

  protected onRegister(): void {
    this._apiService.registerUser(this.userNameFormControl.value ?? '');
  }
}
