import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  FirestoreService,
  MassIntentionSubmission,
} from '../../shared/services/firestore.service';

@Component({
  selector: 'app-mass-intentions',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './mass-intentions.html',
  styleUrls: ['./mass-intentions.scss'],
})
export class MassIntentions implements OnInit {
  private firestoreService = inject(FirestoreService);
  private router = inject(Router);
  private cd = inject(ChangeDetectorRef);

  public submissions: MassIntentionSubmission[] = [];
  public filteredSubmissions: MassIntentionSubmission[] = [];
  public loading = true;
  public selectedStatus: string = 'all';
  public searchTerm = '';

  public statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'completed', label: 'Completed' },
  ];

  async ngOnInit(): Promise<void> {
    await this.loadSubmissions();
  }

  async loadSubmissions(): Promise<void> {
    this.loading = true;
    try {
      this.submissions = await this.firestoreService.getAllMassIntentions();
      this.applyFilters();
    } catch (error) {
      console.error('Error loading mass intentions:', error);
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
    let filtered = [...this.submissions];

    // Filter by status
    if (this.selectedStatus !== 'all') {
      filtered = filtered.filter((s) => s.status === this.selectedStatus);
    }

    // Filter by search term
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter((s) => {
        const formDataStr = JSON.stringify(s.formData).toLowerCase();
        return formDataStr.includes(term);
      });
    }

    this.filteredSubmissions = filtered;
  }

  viewDetails(submission: MassIntentionSubmission): void {
    this.router.navigate(['/mass-intentions', submission.id]);
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
      case 'completed':
        return 'badge-info';
      case 'pending':
      default:
        return 'badge-warning';
    }
  }

  getStatusLabel(status?: string): string {
    return status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Pending';
  }

  // Get first few fields from formData for preview
  getPreviewData(formData: Record<string, any>): string {
    const keys = Object.keys(formData).filter((k) => k !== 'submittedAt');
    const previewKeys = keys.slice(0, 2);
    const preview = previewKeys
      .map((key) => {
        const value = formData[key];
        if (typeof value === 'string' && value.length > 30) {
          return `${key}: ${value.substring(0, 30)}...`;
        }
        return `${key}: ${value}`;
      })
      .join(', ');
    
    return preview || 'No data';
  }
}
