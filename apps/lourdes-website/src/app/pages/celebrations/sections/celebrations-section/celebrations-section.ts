import { Component } from '@angular/core';
import { AbstractBackground } from '../../../../shared/components/abstract-background/abstract-background';
import { SparkIcon } from '../../../../shared/components/icons/spark-icon';
import { LocationIcon } from '../../../../shared/components/icons/location-icon';

const COMPONENTS = [AbstractBackground, SparkIcon, LocationIcon];

interface Celebration {
  date: string;
  location: string;
  time: string;
  celebrant: string;
  celebrationType: string;
  liturgicalCalendar: string;
  specialNotes?: string;
  isHighlighted?: boolean;
}

interface WeeklySchedule {
  day: string;
  time: string;
}

@Component({
  selector: 'app-celebrations-section',
  imports: [...COMPONENTS],
  templateUrl: './celebrations-section.html',
})
export class CelebrationsSection {
  public weeklySchedule: WeeklySchedule[] = [
    { day: 'Monday', time: '9:00 AM' },
    { day: 'Tuesday', time: '9:00 AM' },
    { day: 'Wednesday', time: '7:00 PM' },
    { day: 'Thursday', time: '9:00 AM' },
    { day: 'Friday', time: '9:00 AM' },
    { day: 'Saturday', time: '9:00 AM' },
    { day: 'Sunday', time: '9:30 am' },
  ];

  public celebrations: Celebration[] = [
    {
      date: 'Sunday, January 4',
      location: 'Broekerk',
      time: '09:00',
      celebrant: 'Pastor Frans Wijnen',
      celebrationType: 'Holy Mass',
      liturgicalCalendar: 'Eucharistic celebration',
      specialNotes: 'Opening Mass',
      isHighlighted: true,
    },
    {
      date: 'Monday, January 5',
      location: 'Broekerk',
      time: '09:00',
      celebrant: 'Pastor François',
      celebrationType: 'Holy Mass',
      liturgicalCalendar: 'Eucharistic celebration',
    },
    {
      date: 'Tuesday, January 6',
      location: 'Broekerk',
      time: '09:00',
      celebrant: 'Pastor François',
      celebrationType: 'Holy Mass',
      liturgicalCalendar: 'Eucharistic celebration',
    },
    {
      date: 'Thursday, January 8',
      location: 'St. Location',
      time: '09:00',
      celebrant: 'Pastor François',
      celebrationType: 'Holy Mass',
      liturgicalCalendar: 'Eucharistic celebration',
    },
    {
      date: 'Friday, January 9',
      location: 'Broekerk',
      time: '18:00',
      celebrant: 'Pastor Clariodo',
      celebrationType: 'Holy Mass',
      liturgicalCalendar: 'Eucharistic celebration',
    },
    {
      date: 'Saturday, January 10',
      location: 'Broekerk',
      time: '09:00',
      celebrant: 'Pastor Clariodo',
      celebrationType: 'Holy Mass',
      liturgicalCalendar: 'Eucharistic celebration',
    },
    {
      date: 'Sunday, January 11',
      location: 'Broekerk',
      time: '09:00',
      celebrant: 'Pastor Clariodo',
      celebrationType: 'Holy Mass',
      liturgicalCalendar: 'Eucharistic celebration',
      specialNotes: 'New Year for the Youth',
      isHighlighted: true,
    },
    {
      date: 'Monday, January 12',
      location: 'Broekerk',
      time: '09:00',
      celebrant: 'Pastor Clariodo',
      celebrationType: 'Holy Mass',
      liturgicalCalendar: 'Eucharistic celebration',
    },
    {
      date: 'Tuesday, January 13',
      location: 'Broekerk',
      time: '09:00',
      celebrant: 'Pastor Clariodo',
      celebrationType: 'Holy Mass',
      liturgicalCalendar: 'Eucharistic celebration',
      specialNotes: '1st week after New Year',
      isHighlighted: true,
    },
    {
      date: 'Wednesday, January 14',
      location: 'Broekerk',
      time: '18:00',
      celebrant: 'Pastor Clariodo',
      celebrationType: 'Holy Mass',
      liturgicalCalendar: 'Eucharistic celebration',
      specialNotes: '1st week after New Year',
      isHighlighted: true,
    },
    {
      date: 'Thursday, January 15',
      location: 'Broekerk',
      time: '09:00',
      celebrant: 'Pastor Clariodo',
      celebrationType: 'Holy Mass',
      liturgicalCalendar: 'Eucharistic celebration',
      specialNotes: '1st week after New Year',
      isHighlighted: true,
    },
    {
      date: 'Friday, January 16',
      location: 'Broekerk',
      time: '09:00',
      celebrant: 'Pastor Cyril',
      celebrationType: 'Holy Mass',
      liturgicalCalendar: 'Eucharistic celebration',
      specialNotes: '1st week after New Year',
      isHighlighted: true,
    },
    {
      date: 'Saturday, January 17',
      location: 'St. Location',
      time: '09:00',
      celebrant: 'Pastor Clariodo',
      celebrationType: 'Holy Mass',
      liturgicalCalendar: 'Eucharistic celebration',
      specialNotes: '1st week after New Year',
      isHighlighted: true,
    },
  ];
}
