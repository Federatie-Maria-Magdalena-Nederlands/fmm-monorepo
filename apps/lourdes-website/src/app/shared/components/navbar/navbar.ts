import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [RouterModule],
  templateUrl: './navbar.html',
})
export class Navbar {
  routeItems: {
    label: string;
    path?: string;
    children?: { label: string; path: string }[];
  }[] = [
    { label: 'Home', path: '/home' },
    {
      label: 'About Us',
      children: [
        { label: 'The history of our church', path: '/about/history' },
        { label: 'Catholic youth group soul fire', path: '/about/youth-group' },
        { label: 'Organization', path: '/about/organization' },
        { label: 'Magazine MMM', path: '/about/magazine' },
      ],
    },
    {
      label: 'Sacraments',
      children: [
        { label: 'Baptism', path: '/sacraments/baptism' },
        {
          label: 'Holy first communion',
          path: '/sacraments/holy-first-communion',
        },
        { label: 'Confirmation', path: '/sacraments/confirmation' },
        { label: 'Wedding', path: '/sacraments/wedding' },
        {
          label: 'Annointing of the sick',
          path: '/sacraments/annointing-of-the-sick',
        },
        { label: 'Consecration', path: '/sacraments/consecration' },
      ],
    },
    {
      label: 'Activities',
      children: [
        {
          label: 'Upcoming Activities',
          path: '/activities/upcoming-activities',
        },
        { label: 'Celebrations', path: '/activities/celebrations' },
        {
          label: 'Live streaming celebrations',
          path: '/activities/live-streaming-celebrations',
        },
        { label: 'Bible Course', path: '/activities/bible-course' },
      ],
    },
    {
      label: 'Join Us',
      children: [
        { label: 'Becoming a church member', path: '/join-us/church-member' },
        { label: 'become volunteer', path: '/join-us/volunteer' },
      ],
    },
    { label: 'Mass Intentions', path: '/mass-intentions' },
  ];
}
