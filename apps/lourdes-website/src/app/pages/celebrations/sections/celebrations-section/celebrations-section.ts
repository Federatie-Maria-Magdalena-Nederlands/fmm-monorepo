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
  // orderBy,
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
    { day: 'Monday', time: '9:00 AM' },
    { day: 'Tuesday', time: '9:00 AM' },
    { day: 'Wednesday', time: '7:00 PM' },
    { day: 'Thursday', time: '9:00 AM' },
    { day: 'Friday', time: '9:00 AM' },
    { day: 'Saturday', time: '9:00 AM' },
    { day: 'Sunday', time: '9:30 am' },
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
      const q = query(
        collectionRef,
        where('status', '==', 'published'),
        // orderBy('date', 'asc')
      );

      const querySnapshot = await getDocs(q);
      const celebrations: Celebration[] = [];

      querySnapshot.forEach((docSnapshot) => {
        celebrations.push({
          id: docSnapshot.id,
          ...docSnapshot.data(),
        } as Celebration);
      });
      
      this.celebrations.set(celebrations);
    } catch (error) {
      console.error('Error loading celebrations:', error);
    } finally {
      this.loading.set(false);
    }
  }

  formatDate(date: any): string {
    if (!date) return '';
    
    const d = date instanceof Date ? date : (date as Timestamp).toDate();
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  }

  isHighlighted(celebration: Celebration): boolean {
    return !!celebration.specialNotes;
  }
}
