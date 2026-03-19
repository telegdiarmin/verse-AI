import { Component, effect } from '@angular/core';
import { Router } from '@angular/router';
import { TokenService } from '../../services/token';
import { routeVerse } from '../../app.routes';
import { Button } from '../ui-elements/button/button';
import { TextField } from '../ui-elements/text-field/text-field';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'vai-registration',
  imports: [Button, TextField, ReactiveFormsModule],
  templateUrl: './registration.html',
  styleUrl: './registration.css',
})
export class Registration {
  protected userNameFormControl = new FormControl('', { validators: [Validators.required] });

  protected sub = this.userNameFormControl.statusChanges.subscribe((asd) =>{
      console.log(this.userNameFormControl.valid);
  });

  constructor(private readonly router: Router, private readonly tokenService: TokenService) {
    effect(() => {
      if (!!this.tokenService.userToken()) {
        this.router.navigate([`/${routeVerse}`]);
      }
    });
  }

  protected onRegister(): void {
    // TODO: replace this with API call
    this.tokenService.setUserToken('asd');
  }
}
