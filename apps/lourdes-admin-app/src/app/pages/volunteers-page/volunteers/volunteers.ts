import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  FirestoreService,
  VolunteerSubmission,
} from '../../../shared/services/firestore.service';

@Component({
  selector: 'app-volunteers',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './volunteers.html',
  styleUrls: ['./volunteers.scss'],
})
export class Volunteers implements OnInit {
  private firestoreService = inject(FirestoreService);
  private router = inject(Router);
  private cd = inject(ChangeDetectorRef);

  public volunteers: VolunteerSubmission[] = [];
  public filteredVolunteers: VolunteerSubmission[] = [];
  public loading = true;
  public selectedStatus: string = 'all';
  public searchTerm = '';

  public statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
  ];

  async ngOnInit(): Promise<void> {
    await this.loadVolunteers();
  }

  async loadVolunteers(): Promise<void> {
    this.loading = true;
    try {
      this.volunteers = await this.firestoreService.getAllVolunteers();
      this.applyFilters();
    } catch (error) {
      console.error('Error loading volunteers:', error);
    } finally {
      this.loading = false;
      this.cd.detectChanges();
    }
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  onSearch(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.volunteers];

    // Filter by status
    if (this.selectedStatus !== 'all') {
      filtered = filtered.filter((v) => v.status === this.selectedStatus);
    }

    // Filter by search term
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter((v) => {
        const formDataStr = JSON.stringify(v.formData).toLowerCase();
        return formDataStr.includes(term);
      });
    }

    this.filteredVolunteers = filtered;
  }

  viewDetails(volunteer: VolunteerSubmission): void {
    this.router.navigate(['/volunteers', volunteer.id]);
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

  getPreviewData(formData: Record<string, any>): Array<{ key: string; value: string }> {
    const entries = Object.entries(formData);
    return entries.slice(0, 2).map(([key, value]) => ({
      key: this.formatFieldName(key),
      value: this.truncateValue(String(value)),
    }));
  }

  private formatFieldName(key: string): string {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  }

  private truncateValue(value: string, maxLength: number = 30): string {
    return value.length > maxLength ? value.substring(0, maxLength) + '...' : value;
  }
}
