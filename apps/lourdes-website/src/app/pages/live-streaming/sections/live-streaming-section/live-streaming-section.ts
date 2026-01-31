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
  limit,
  Timestamp,
} from 'firebase/firestore';

interface LiveCelebration {
  id: string;
  title: string;
  description: string;
  date?: Date | Timestamp;
  time?: string;
  liveStreamUrl: string;
  status?: 'draft' | 'published';
  createdAt: Date | Timestamp;
  updatedAt?: Date | Timestamp;
}

const COMPONENTS = [AbstractBackground, SparkIcon, CommonModule];

@Component({
  selector: 'app-live-streaming-section',
  imports: [...COMPONENTS],
  templateUrl: './live-streaming-section.html',
})
export class LiveStreamingSection implements OnInit {
  private db: Firestore;
  public youtubeChannelUrl = 'https://www.youtube.com/@LourdesParish';
  public liveCelebrations = signal<LiveCelebration[]>([]);
  public loading = signal(true);

  constructor(private firebaseService: FirebaseService) {
    this.db = this.firebaseService.getDatabase();
  }

  async ngOnInit(): Promise<void> {
    await this.loadLiveCelebrations();
  }

  async loadLiveCelebrations(): Promise<void> {
    this.loading.set(true);
    try {
      const collectionRef = collection(this.db, 'live-celebrations');
      const q = query(
        collectionRef,
        where('status', '==', 'published'),
        limit(20)
      );

      const querySnapshot = await getDocs(q);
      const celebrations: LiveCelebration[] = [];

      querySnapshot.forEach((docSnapshot) => {
        celebrations.push({
          id: docSnapshot.id,
          ...docSnapshot.data(),
        } as LiveCelebration);
      });
      
      this.liveCelebrations.set(celebrations);
    } catch (error) {
      console.error('Error loading live celebrations:', error);
    } finally {
      this.loading.set(false);
    }
  }

  formatSchedule(celebration: LiveCelebration): string {
    if (!celebration.date && !celebration.time) return '';
    
    let schedule = '';
    
    if (celebration.date) {
      const d = celebration.date instanceof Date ? celebration.date : (celebration.date as Timestamp).toDate();
      schedule = d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }
    
    if (celebration.time) {
      schedule += schedule ? ` at ${celebration.time}` : celebration.time;
    }
    
    return schedule;
  }

  truncateText(text: string, maxLength: number = 120): string {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }

  isLive(celebration: LiveCelebration): boolean {
    // Check if the celebration is happening now
    if (!celebration.date) return false;
    
    const now = new Date();
    const celebrationDate = celebration.date instanceof Date ? celebration.date : (celebration.date as Timestamp).toDate();
    
    // Check if it's the same day
    const isSameDay = celebrationDate.toDateString() === now.toDateString();
    
    if (!isSameDay) return false;
    
    // If there's a time, check if it's within 1 hour before or 2 hours after
    if (celebration.time) {
      const [hours, minutes] = celebration.time.split(':').map(Number);
      const celebrationTime = new Date(celebrationDate);
      celebrationTime.setHours(hours, minutes, 0);
      
      const timeDiff = now.getTime() - celebrationTime.getTime();
      const hoursDiff = timeDiff / (1000 * 60 * 60);
      
      // Live if within 1 hour before or 2 hours after the scheduled time
      return hoursDiff >= -1 && hoursDiff <= 2;
    }
    
    return isSameDay;
  }
}
