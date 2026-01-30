import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  FirestoreService,
  LiveCelebration,
} from '../../../shared/services/firestore.service';

@Component({
  selector: 'app-live-celebrations',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './live-celebrations.html',
  styleUrls: ['./live-celebrations.scss'],
})
export class LiveCelebrations implements OnInit {
  private firestoreService = inject(FirestoreService);
  private router = inject(Router);
  private cd = inject(ChangeDetectorRef);

  public celebrations: LiveCelebration[] = [];
  public filteredCelebrations: LiveCelebration[] = [];
  public loading = true;
  public selectedStatus: string = 'all';
  public searchTerm = '';

  public statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'draft', label: 'Draft' },
    { value: 'published', label: 'Published' },
  ];

  async ngOnInit(): Promise<void> {
    await this.loadCelebrations();
  }

  async loadCelebrations(): Promise<void> {
    this.loading = true;
    try {
      this.celebrations = await this.firestoreService.getAllLiveCelebrations();
      this.applyFilters();
    } catch (error) {
      console.error('Error loading live celebrations:', error);
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
    let filtered = [...this.celebrations];

    // Filter by status
    if (this.selectedStatus !== 'all') {
      filtered = filtered.filter((c) => c.status === this.selectedStatus);
    }

    // Filter by search term
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter((c) => {
        return (
          c.title.toLowerCase().includes(term) ||
          c.description.toLowerCase().includes(term)
        );
      });
    }

    this.filteredCelebrations = filtered;
  }

  viewDetails(celebration: LiveCelebration): void {
    this.router.navigate(['/live-celebrations', celebration.id]);
  }

  createNew(): void {
    this.router.navigate(['/live-celebrations', 'new']);
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
