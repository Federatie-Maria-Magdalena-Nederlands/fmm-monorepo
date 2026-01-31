import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractBackground } from '../../../../shared/components/abstract-background/abstract-background';
import { SparkIcon } from '../../../../shared/components/icons/spark-icon';
import { FirebaseService } from '../../../../shared/services/firebase.service';
import {
  Firestore,
  collection,
  getDocs,
  query,
  where,
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

const COMPONENTS = [AbstractBackground, SparkIcon, CommonModule];

@Component({
  selector: 'app-activities-section',
  imports: [...COMPONENTS],
  templateUrl: './activities-section.html',
})
export class ActivitiesSection implements OnInit {
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

  formatSchedule(activity: Activity): string {
    if (!activity.date && !activity.time) return '';
    
    let schedule = '';
    
    if (activity.date) {
      const d = activity.date instanceof Date ? activity.date : (activity.date as Timestamp).toDate();
      schedule = d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }
    
    if (activity.time) {
      schedule += schedule ? ` at ${activity.time}` : activity.time;
    }
    
    return schedule;
  }

  truncateText(text: string, maxLength: number = 120): string {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }
}
