import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Firestore,
  collection,
  getDocs,
  query,
  where,
  limit,
  Timestamp,
} from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { environment } from '../../../../../environments/environment';

// Initialize Firebase app
const firebaseApp = initializeApp(environment.firebase);

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
  public activities: Activity[] = [];
  public loading = true;

  constructor() {
    this.db = getFirestore(firebaseApp);
  }

  async ngOnInit(): Promise<void> {
    await this.loadActivities();
  }

  async loadActivities(): Promise<void> {
    this.loading = true;
    try {
      const collectionRef = collection(this.db, 'activities');
      const q = query(
        collectionRef,
        where('status', '==', 'published'),
        limit(6)
      );

      const querySnapshot = await getDocs(q);
      this.activities = [];

      querySnapshot.forEach((docSnapshot) => {
        this.activities.push({
          id: docSnapshot.id,
          ...docSnapshot.data(),
        } as Activity);
      });
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      this.loading = false;
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
