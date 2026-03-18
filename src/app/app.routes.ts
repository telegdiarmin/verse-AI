import { Routes } from '@angular/router';
import { Admin } from './components/admin/admin';
import { Registration } from './components/registration/registration';
import { Verse } from './components/verse/verse';
import { RegistrationGuard } from './registration.guard';

export const rootAdmin = 'admin';
export const rootRegistration = 'resgistration';
export const rootVerse = 'verse';

export const routes: Routes = [
  {
    path: rootAdmin,
    component: Admin,
    pathMatch: 'full',
  },
  {
    path: rootRegistration,
    component: Registration,
    pathMatch: 'full',
  },
  {
    path: rootVerse,
    component: Verse,
    pathMatch: 'full',
    canActivate: [RegistrationGuard]
  },
  {
    path: '**',
    redirectTo: `/${rootRegistration}`
  }
];
