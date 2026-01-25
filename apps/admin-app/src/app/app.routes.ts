import { Route } from '@angular/router';
import { authGuard } from './shared/guards/auth.guard';

export const appRoutes: Route[] = [
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login').then((m) => m.Login),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard').then((m) => m.Dashboard),
    canActivate: [authGuard],
  },
  {
    path: 'sacraments',
    loadComponent: () =>
      import('./pages/sacraments-page/sacraments/sacraments').then((m) => m.Sacraments),
    canActivate: [authGuard],
  },
  {
    path: 'sacraments/:type/:id',
    loadComponent: () =>
      import('./pages/sacraments-page/sacrament-detail/sacrament-detail').then(
        (m) => m.SacramentDetail
      ),
    canActivate: [authGuard],
  },
  {
    path: 'mass-intentions',
    loadComponent: () =>
      import('./pages/mass-intentions/mass-intentions').then((m) => m.MassIntentions),
    canActivate: [authGuard],
  },
  {
    path: 'mass-intentions/:id',
    loadComponent: () =>
      import('./pages/mass-intention-detail/mass-intention-detail').then(
        (m) => m.MassIntentionDetail
      ),
    canActivate: [authGuard],
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
];
