import { MenuItem } from '../models/interfaces/menu-item.interface';

export const MENU_ITEMS: MenuItem[] = [
  { label: 'Home', path: '/home' },
  {
    label: 'About Us',
    children: [
      { label: 'The History of our Church', path: '/history' },
      { label: 'Catholic Youth Group Soul Fire', path: '/youth-group' },
      { label: 'Organization', path: '/organization' },
      { label: 'Magazine MMM', path: '/magazine' },
    ],
  },
  {
    label: 'Sacraments',
    children: [
      { label: 'Baptism', path: '/baptism' },
      {
        label: 'Holy First Communion',
        path: '/holy-first-communion',
      },
      { label: 'Confirmation', path: '/confirmation' },
      { label: 'Wedding', path: '/wedding' },
      {
        label: 'Annointing of the Sick',
        path: '/annointing-of-the-sick',
      },
      { label: 'Consecration', path: '/consecration' },
    ],
  },
  {
    label: 'Activities',
    children: [
      {
        label: 'Our Activities',
        path: '/our-activities',
      },
      { label: 'Celebrations', path: '/celebrations' },
      {
        label: 'Live Streaming Celebrations',
        path: '/live-streaming-celebrations',
      },
      { label: 'Bible Course', path: '/bible-course' },
    ],
  },
  {
    label: 'Join Us',
    children: [
      { label: 'Becoming a Church Member', path: '/church-member' },
      { label: 'Become Volunteer', path: '/volunteer' },
    ],
  },
  { label: 'Mass Intentions', path: '/mass-intentions' },
];
