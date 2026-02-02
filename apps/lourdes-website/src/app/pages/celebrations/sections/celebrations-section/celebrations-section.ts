import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractBackground } from '../../../../shared/components/abstract-background/abstract-background';
import { SparkIcon } from '../../../../shared/components/icons/spark-icon';
import { LocationIcon } from '../../../../shared/components/icons/location-icon';
import { FirebaseService } from '../../../../shared/services/firebase.service';
import {
  Firestore,
  collection,
  getDocs,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';

const COMPONENTS = [AbstractBackground, SparkIcon, LocationIcon, CommonModule];

interface Celebration {
  id: string;
  date?: Date | Timestamp;
  church: string;
  location: string;
  time?: string;
  celebrant: string;
  celebrationType: string;
  liturgicalCalendar?: string;
  specialNotes?: string;
  status?: 'draft' | 'published';
  createdAt: Date | Timestamp;
  updatedAt?: Date | Timestamp;
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
export class CelebrationsSection implements OnInit {
  private db: Firestore;
  public celebrations = signal<Celebration[]>([]);
  public loading = signal(true);

  public weeklySchedule: WeeklySchedule[] = [
    { day: 'Maandag', time: '9:00 AM' },
    { day: 'Dinsdag', time: '9:00 AM' },
    { day: 'Woensdag', time: '7:00 PM' },
    { day: 'Donderdag', time: '9:00 AM' },
    { day: 'Vrijdag', time: '9:00 AM' },
    { day: 'Zaterdag', time: '9:00 AM' },
    { day: 'Zondag', time: '9:30 AM' },
  ];

  constructor(private firebaseService: FirebaseService) {
    this.db = this.firebaseService.getDatabase();
  }

  async ngOnInit(): Promise<void> {
    await this.loadCelebrations();
  }

  async loadCelebrations(): Promise<void> {
    this.loading.set(true);
    try {
      const collectionRef = collection(this.db, 'celebrations');
      // Query without orderBy to avoid composite index requirement
      const q = query(
        collectionRef,
        where('status', '==', 'published')
      );

      const querySnapshot = await getDocs(q);
      const celebrations: Celebration[] = [];

      querySnapshot.forEach((docSnapshot) => {
        celebrations.push({
          id: docSnapshot.id,
          ...docSnapshot.data(),
        } as Celebration);
      });
      
      // Sort client-side by date
      celebrations.sort((a, b) => {
        const dateA = a.date instanceof Date ? a.date : (a.date as Timestamp)?.toDate() || new Date(0);
        const dateB = b.date instanceof Date ? b.date : (b.date as Timestamp)?.toDate() || new Date(0);
        return dateA.getTime() - dateB.getTime();
      });
      
      this.celebrations.set(celebrations);
    } catch (error) {
      console.error('Error loading celebrations:', error);
      console.error('Full error details:', JSON.stringify(error, null, 2));
    } finally {
      this.loading.set(false);
    }
  }

  formatDate(date: any): string {
    if (!date) return '';
    
    const d = date instanceof Date ? date : (date as Timestamp).toDate();
    return d.toLocaleDateString('nl-NL', { weekday: 'long', month: 'long', day: 'numeric' });
  }

  isHighlighted(celebration: Celebration): boolean {
    return !!celebration.specialNotes;
  }
}
