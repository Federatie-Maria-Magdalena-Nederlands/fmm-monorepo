import { MenuItem } from '../models/interfaces/menu-item.interface';

export const MENU_ITEMS: MenuItem[] = [
  { label: 'Home', path: '/home' },
  {
    label: 'Over Ons',
    children: [
      { label: 'De Geschiedenis van Onze Kerk', path: '/history' },
      { label: 'Katholieke Jeugdgroep Soul Fire', path: '/youth-group' },
      { label: 'Organisatie', path: '/organization' },
      { label: 'Tijdschrift MMM', path: '/magazine' },
    ],
  },
  {
    label: 'Sacramenten',
    children: [
      { label: 'Doop', path: '/baptism' },
      {
        label: 'Eerste Heilige Communie',
        path: '/holy-communion',
      },
      { label: 'Vormsel', path: '/confirmation' },
      { label: 'Huwelijk', path: '/wedding' },
      {
        label: 'Ziekenzalving',
        path: '/annointing',
      },
      { label: 'Wijding', path: '/consecration' },
    ],
  },
  {
    label: 'Activiteiten',
    children: [
      {
        label: 'Onze Activiteiten',
        path: '/our-activities',
      },
      { label: 'Vieringen', path: '/celebrations' },
      {
        label: 'Live Streaming Vieringen',
        path: '/live-streaming-celebrations',
      },
      { label: 'Bijbelcursus', path: '/bible-course' },
    ],
  },
  {
    label: 'Doe Mee',
    children: [
      { label: 'Lid Worden van de Kerk', path: '/church-member' },
      { label: 'Word Vrijwilliger', path: '/volunteer' },
    ],
  },
  { label: 'Misintentie', path: '/mass-intentions' },
];
