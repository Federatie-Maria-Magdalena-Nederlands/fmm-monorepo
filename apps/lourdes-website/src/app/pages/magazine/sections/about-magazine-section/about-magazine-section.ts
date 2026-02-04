import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractBackground } from '../../../../shared/components/abstract-background/abstract-background';
import { SparkIcon } from '../../../../shared/components/icons/spark-icon';
import { BookOpenIcon } from '../../../../shared/components/icons/book-open-icon';
import {
  collection,
  getDocs,
  getFirestore,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';

const COMPONENTS = [AbstractBackground, SparkIcon, BookOpenIcon];

interface Magazine {
  id: string;
  title: string;
  date: Date | Timestamp;
  fileUrl: string;
  fileName?: string;
  status?: 'draft' | 'published';
  createdAt: Date | Timestamp;
}

@Component({
  selector: 'app-about-magazine-section',
  imports: [...COMPONENTS, BookOpenIcon, CommonModule],
  templateUrl: './about-magazine-section.html',
})
export class AboutMagazineSection implements OnInit {
  private db = getFirestore();
  
  public magazines = signal<Magazine[]>([]);
  public loading = signal(true);

  async ngOnInit(): Promise<void> {
    await this.loadMagazines();
  }

  async loadMagazines(): Promise<void> {
    this.loading.set(true);
    try {
      const magazinesRef = collection(this.db, 'magazines');
      const q = query(
        magazinesRef,
        where('status', '==', 'published')
      );
      
      const querySnapshot = await getDocs(q);
      
      const magazinesList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Magazine[];

      // Sort by date descending (client-side)
      magazinesList.sort((a, b) => {
        const dateA = a.date instanceof Date ? a.date : (a.date as Timestamp).toDate();
        const dateB = b.date instanceof Date ? b.date : (b.date as Timestamp).toDate();
        return dateB.getTime() - dateA.getTime();
      });

      this.magazines.set(magazinesList);
    } catch (error) {
      console.error('Error loading magazines:', error);
    } finally {
      this.loading.set(false);
    }
  }

  formatDate(date: Date | Timestamp): string {
    const d = date instanceof Date ? date : (date as Timestamp).toDate();
    return d.toLocaleDateString('nl-NL', { year: 'numeric', month: 'long' });
  }

  openPDF(fileUrl: string): void {
    window.open(fileUrl, '_blank');
  }
}
