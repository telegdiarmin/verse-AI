import { Injectable } from '@angular/core';
import { CanActivate, CanDeactivate, Router } from '@angular/router';
import { TokenService } from './services/token';
import { routeRegistration } from './app.routes';

@Injectable({ providedIn: 'root' })
export class RegistrationGuard implements CanActivate {

  constructor(
    private tokenService: TokenService,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (!this.tokenService.userToken()) {
      this.router.navigate([`/${routeRegistration}`]);

      return false;
    }

    return true;
  }
}