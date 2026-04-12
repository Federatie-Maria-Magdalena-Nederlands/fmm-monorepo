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
  public processingId: string | null = null;

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

  getStatusClass(status?: string): string {
    switch (status) {
      case 'approved':
        return 'badge-success';
      case 'rejected':
        return 'badge-error';
      default:
        return 'badge-warning';
    }
  }

  async approveRegistration(registration: BibleCourseRegistration): Promise<void> {
    if (this.processingId) return;

    this.processingId = registration.id;
    try {
      await this.firestoreService.updateBibleCourseStatus(
        registration.id,
        'approved',
      );
      registration.status = 'approved';
      registration.processedAt = new Date();
    } catch (error) {
      console.error('Error approving registration:', error);
    } finally {
      this.processingId = null;
      this.cd.detectChanges();
    }
  }

  async rejectRegistration(registration: BibleCourseRegistration): Promise<void> {
    if (this.processingId) return;

    this.processingId = registration.id;
    try {
      await this.firestoreService.updateBibleCourseStatus(
        registration.id,
        'rejected',
      );
      registration.status = 'rejected';
      registration.processedAt = new Date();
    } catch (error) {
      console.error('Error rejecting registration:', error);
    } finally {
      this.processingId = null;
      this.cd.detectChanges();
    }
  }

  async deleteRegistration(registration: BibleCourseRegistration): Promise<void> {
    if (this.processingId) return;

    const confirmed = confirm(
      'Are you sure you want to delete this registration? This action cannot be undone.',
    );

    if (!confirmed) return;

    this.processingId = registration.id;
    try {
      await this.firestoreService.deleteBibleCourseRegistration(
        registration.id,
      );
      this.registrations = this.registrations.filter(
        (item) => item.id !== registration.id,
      );
      this.applyFilters();
    } catch (error) {
      console.error('Error deleting registration:', error);
      alert('Failed to delete registration. Please try again.');
    } finally {
      this.processingId = null;
      this.cd.detectChanges();
    }
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
