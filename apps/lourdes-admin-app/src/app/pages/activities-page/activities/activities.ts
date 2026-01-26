import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  FirestoreService,
  Activity,
} from '../../../shared/services/firestore.service';

@Component({
  selector: 'app-activities',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './activities.html',
  styleUrls: ['./activities.scss'],
})
export class Activities implements OnInit {
  private firestoreService = inject(FirestoreService);
  private router = inject(Router);
  private cd = inject(ChangeDetectorRef);

  public activities: Activity[] = [];
  public filteredActivities: Activity[] = [];
  public loading = true;
  public selectedStatus: string = 'all';
  public searchTerm = '';

  public statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'draft', label: 'Draft' },
    { value: 'published', label: 'Published' },
  ];

  async ngOnInit(): Promise<void> {
    await this.loadActivities();
  }

  async loadActivities(): Promise<void> {
    this.loading = true;
    try {
      this.activities = await this.firestoreService.getAllActivities();
      this.applyFilters();
    } catch (error) {
      console.error('Error loading activities:', error);
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
    let filtered = [...this.activities];

    // Filter by status
    if (this.selectedStatus !== 'all') {
      filtered = filtered.filter((a) => a.status === this.selectedStatus);
    }

    // Filter by search term
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter((a) => {
        return (
          a.title.toLowerCase().includes(term) ||
          a.description.toLowerCase().includes(term)
        );
      });
    }

    this.filteredActivities = filtered;
  }

  viewDetails(activity: Activity): void {
    this.router.navigate(['/activities', activity.id]);
  }

  createNew(): void {
    this.router.navigate(['/activities', 'new']);
  }

  formatDate(date: any): string {
    return this.firestoreService.formatDate(date);
  }

  getStatusClass(status?: string): string {
    switch (status) {
      case 'published':
        return 'badge-success';
      case 'draft':
        return 'badge-warning';
      default:
        return 'badge-ghost';
    }
  }

  truncateText(text: string, maxLength: number = 100): string {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }
}
