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
    path: 'donations',
    loadComponent: () =>
      import('./pages/donations-page/donations/donations').then((m) => m.Donations),
    canActivate: [authGuard],
  },
  {
    path: 'donations/:id',
    loadComponent: () =>
      import('./pages/donations-page/donation-detail/donation-detail').then(
        (m) => m.DonationDetail
      ),
    canActivate: [authGuard],
  },
  {
    path: 'volunteers',
    loadComponent: () =>
      import('./pages/volunteers-page/volunteers/volunteers').then((m) => m.Volunteers),
    canActivate: [authGuard],
  },
  {
    path: 'volunteers/:id',
    loadComponent: () =>
      import('./pages/volunteers-page/volunteer-detail/volunteer-detail').then(
        (m) => m.VolunteerDetail
      ),
    canActivate: [authGuard],
  },
  {
    path: 'contact-us',
    loadComponent: () =>
      import('./pages/contact-us-page/contact-us/contact-us').then((m) => m.ContactUs),
    canActivate: [authGuard],
  },
  {
    path: 'contact-us/:id',
    loadComponent: () =>
      import('./pages/contact-us-page/contact-us-detail/contact-us-detail').then(
        (m) => m.ContactUsDetail
      ),
    canActivate: [authGuard],
  },
  {
    path: 'members',
    loadComponent: () =>
      import('./pages/member-pages/members/members').then((m) => m.Members),
    canActivate: [authGuard],
  },
  {
    path: 'members/:id',
    loadComponent: () =>
      import('./pages/member-pages/member-detail/member-detail').then(
        (m) => m.MemberDetail
      ),
    canActivate: [authGuard],
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
];
