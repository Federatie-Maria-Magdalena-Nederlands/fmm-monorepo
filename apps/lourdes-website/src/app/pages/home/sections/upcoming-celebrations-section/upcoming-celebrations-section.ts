import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirebaseService } from '../../../../shared/services/firebase.service';
import {
  Firestore,
  collection,
  getDocs,
  query,
  where,
  limit,
  Timestamp,
} from 'firebase/firestore';

interface Activity {
  id: string;
  title: string;
  description: string;
  image?: string;
  body: string;
  date?: Date | Timestamp;
  time?: string;
  status?: 'draft' | 'published';
  createdAt: Date | Timestamp;
  updatedAt?: Date | Timestamp;
}

@Component({
  selector: 'app-upcoming-celebrations-section',
  imports: [CommonModule],
  templateUrl: './upcoming-celebrations-section.html',
})
export class UpcomingCelebrationsSection implements OnInit {
  private db: Firestore;
  public activities = signal<Activity[]>([]);
  public loading = signal(true);

  constructor(private firebaseService: FirebaseService) {
    this.db = this.firebaseService.getDatabase();
  }

  async ngOnInit(): Promise<void> {
    await this.loadActivities();
  }

  async loadActivities(): Promise<void> {
    this.loading.set(true);
    try {
      const collectionRef = collection(this.db, 'activities');
      const q = query(
        collectionRef,
        where('status', '==', 'published'),
        limit(6)
      );

      const querySnapshot = await getDocs(q);
      const activities: Activity[] = [];

      querySnapshot.forEach((docSnapshot) => {
        activities.push({
          id: docSnapshot.id,
          ...docSnapshot.data(),
        } as Activity);
      });
      
      this.activities.set(activities);
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      this.loading.set(false);
    }
  }

  formatDate(date: any): { day: string; month: string; dayOfWeek: string } {
    if (!date) return { day: '', month: '', dayOfWeek: '' };
    
    const d = date instanceof Date ? date : (date as Timestamp).toDate();
    const dayOfWeek = d.toLocaleDateString('en-US', { weekday: 'long' });
    const day = d.getDate().toString().padStart(2, '0');
    const month = d.toLocaleDateString('en-US', { month: 'long' });
    
    return { day, month, dayOfWeek };
  }

  truncateText(text: string, maxLength: number = 120): string {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }
}
