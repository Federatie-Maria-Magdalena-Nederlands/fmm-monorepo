import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AbstractBackground } from '../../shared/components/abstract-background/abstract-background';
import { SparkIcon } from '../../shared/components/icons/spark-icon';
import { FirebaseService } from '../../shared/services/firebase.service';
import { Firestore, doc, getDoc, Timestamp } from 'firebase/firestore';

interface Activity {
  id: string;
  title: string;
  description: string;
  image?: string;
  images?: string[];
  body: string;
  date?: Date | Timestamp;
  time?: string;
  status?: 'draft' | 'published';
  createdAt: Date | Timestamp;
  updatedAt?: Date | Timestamp;
}

const COMPONENTS = [AbstractBackground, SparkIcon, CommonModule, RouterModule];

@Component({
  selector: 'app-activity-detail',
  imports: [...COMPONENTS],
  templateUrl: './activity-detail.html',
})
export class ActivityDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private db: Firestore;

  public activity = signal<Activity | null>(null);
  public loading = signal(true);
  public notFound = signal(false);
  public activeImageIndex = signal(0);

  constructor(private firebaseService: FirebaseService) {
    this.db = this.firebaseService.getDatabase();
  }

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.notFound.set(true);
      this.loading.set(false);
      return;
    }
    await this.loadActivity(id);
  }

  async loadActivity(id: string): Promise<void> {
    this.loading.set(true);
    try {
      const docRef = doc(this.db, 'activities', id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = { id: docSnap.id, ...docSnap.data() } as Activity;
        if (data.status === 'published') {
          this.activity.set(data);
        } else {
          this.notFound.set(true);
        }
      } else {
        this.notFound.set(true);
      }
    } catch (error) {
      console.error('Error loading activity:', error);
      this.notFound.set(true);
    } finally {
      this.loading.set(false);
    }
  }

  getImages(): string[] {
    const activity = this.activity();
    if (!activity) return [];
    if (activity.images?.length) return activity.images;
    return activity.image ? [activity.image] : [];
  }

  selectImage(index: number): void {
    this.activeImageIndex.set(index);
  }

  formatSchedule(): string {
    const activity = this.activity();
    if (!activity || (!activity.date && !activity.time)) return '';

    let schedule = '';
    if (activity.date) {
      const d =
        activity.date instanceof Date
          ? activity.date
          : (activity.date as Timestamp).toDate();
      schedule = d.toLocaleDateString('nl-NL', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }

    if (activity.time) {
      schedule += schedule ? ` om ${activity.time}` : activity.time;
    }

    return schedule;
  }

  goBack(): void {
    this.router.navigate(['/our-activities']);
  }
}
