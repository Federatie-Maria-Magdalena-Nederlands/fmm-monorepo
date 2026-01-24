import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home').then((m) => m.Home),
  },
  {
    path: 'history',
    loadComponent: () =>
      import('./pages/history/history').then((m) => m.History),
  },
  {
    path: 'youth-group',
    loadComponent: () =>
      import('./pages/soulfire/soulfire').then((m) => m.Soulfire),
  },
  {
    path: 'organization',
    loadComponent: () =>
      import('./pages/organization/organization').then((m) => m.Organization),
  },
  {
    path: 'magazine',
    loadComponent: () =>
      import('./pages/magazine/magazine').then((m) => m.Magazine),
  },
  {
    path: 'our-activities',
    loadComponent: () =>
      import('./pages/our-activities/our-activities').then(
        (m) => m.OurActivities,
      ),
  },
  {
    path: 'live-streaming-celebrations',
    loadComponent: () =>
      import('./pages/live-streaming/live-streaming').then(
        (m) => m.LiveStreaming,
      ),
  },
  {
    path: 'bible-course',
    loadComponent: () =>
      import('./pages/bible-course/bible-course').then((m) => m.BibleCourse),
  },
  {
    path: 'celebrations',
    loadComponent: () =>
      import('./pages/celebrations/celebrations').then((m) => m.Celebrations),
  },
  // Not Found Route
  {
    path: '**',
    redirectTo: 'not-found',
  },
  {
    path: 'not-found',
    loadComponent: () =>
      import('./pages/not-found/not-found').then((m) => m.NotFound),
  },
];
