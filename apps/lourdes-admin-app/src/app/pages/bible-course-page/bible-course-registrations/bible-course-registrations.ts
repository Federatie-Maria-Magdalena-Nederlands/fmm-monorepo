import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  BibleCourseRegistration,
  FirestoreService,
} from '../../../shared/services/firestore.service';

@Component({
  selector: 'app-bible-course-registrations',
  imports: [CommonModule, FormsModule],
  templateUrl: './bible-course-registrations.html',
  styleUrls: ['./bible-course-registrations.scss'],
})
export class BibleCourseRegistrations implements OnInit {
  private firestoreService = inject(FirestoreService);
  private cd = inject(ChangeDetectorRef);

  public registrations: BibleCourseRegistration[] = [];
  public filteredRegistrations: BibleCourseRegistration[] = [];
  public loading = true;
  public searchTerm = '';

  async ngOnInit(): Promise<void> {
    await this.loadRegistrations();
  }

  async loadRegistrations(): Promise<void> {
    this.loading = true;
    try {
      this.registrations =
        await this.firestoreService.getAllBibleCourseRegistrations();
      this.applyFilters();
    } catch (error) {
      console.error('Error loading bible course registrations:', error);
    } finally {
      this.loading = false;
      this.cd.detectChanges();
    }
  }

  onSearch(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.registrations];

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter((r) => {
        const formDataStr = JSON.stringify(r.formData || {}).toLowerCase();
        return formDataStr.includes(term);
      });
    }

    this.filteredRegistrations = filtered;
  }

  formatDate(date: any): string {
    return this.firestoreService.formatDate(date);
  }

  getFullName(formData: Record<string, any>): string {
    const firstName = String(formData['firstName'] || '').trim();
    const lastName = String(formData['lastName'] || '').trim();
    return `${firstName} ${lastName}`.trim() || '-';
  }

  getFieldValue(formData: Record<string, any>, key: string): string {
    const value = formData?.[key];
    return value ? String(value) : '-';
  }
}
