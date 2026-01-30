import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  FirestoreService,
  Blog,
} from '../../../shared/services/firestore.service';

@Component({
  selector: 'app-blogs',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './blogs.html',
  styleUrls: ['./blogs.scss'],
})
export class Blogs implements OnInit {
  private firestoreService = inject(FirestoreService);
  private router = inject(Router);
  private cd = inject(ChangeDetectorRef);

  public blogs: Blog[] = [];
  public filteredBlogs: Blog[] = [];
  public loading = true;
  public selectedStatus: string = 'all';
  public searchTerm = '';

  public statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'draft', label: 'Draft' },
    { value: 'published', label: 'Published' },
  ];

  async ngOnInit(): Promise<void> {
    await this.loadBlogs();
  }

  async loadBlogs(): Promise<void> {
    this.loading = true;
    try {
      this.blogs = await this.firestoreService.getAllBlogs();
      this.applyFilters();
    } catch (error) {
      console.error('Error loading blogs:', error);
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
    let filtered = [...this.blogs];

    // Filter by status
    if (this.selectedStatus !== 'all') {
      filtered = filtered.filter((b) => b.status === this.selectedStatus);
    }

    // Filter by search term
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter((b) => {
        return (
          b.title.toLowerCase().includes(term) ||
          b.description.toLowerCase().includes(term)
        );
      });
    }

    this.filteredBlogs = filtered;
  }

  viewDetails(blog: Blog): void {
    this.router.navigate(['/blogs', blog.id]);
  }

  createNew(): void {
    this.router.navigate(['/blogs', 'new']);
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
