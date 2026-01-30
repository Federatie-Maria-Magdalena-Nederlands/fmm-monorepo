import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractBackground } from '../../../../shared/components/abstract-background/abstract-background';
import { SparkIcon } from '../../../../shared/components/icons/spark-icon';
import {
  Firestore,
  collection,
  getDocs,
  query,
  where,
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

const COMPONENTS = [AbstractBackground, SparkIcon, CommonModule];

@Component({
  selector: 'app-activities-section',
  imports: [...COMPONENTS],
  templateUrl: './activities-section.html',
})
export class ActivitiesSection implements OnInit {
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
