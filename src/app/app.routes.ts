import { Routes } from '@angular/router';

import { Admin } from './components/admin/admin';
import { Registration } from './components/registration/registration';
import { Verse } from './components/verse/verse';
import { RegistrationGuard } from './registration.guard';

export const routeAdmin = 'admin';
export const routeRegistration = 'registration';
export const routeVerse = 'verse';

export const routes: Routes = [
  {
    path: routeAdmin,
    component: Admin,
    pathMatch: 'full',
    canActivate: [RegistrationGuard],
  },
  {
    path: routeRegistration,
    component: Registration,
    pathMatch: 'full',
  },
  {
    path: routeVerse,
    component: Verse,
    pathMatch: 'full',
    canActivate: [RegistrationGuard],
  },
  {
    path: '**',
    redirectTo: `/${routeRegistration}`,
  },
];
