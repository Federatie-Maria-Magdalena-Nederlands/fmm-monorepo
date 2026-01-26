import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  FirestoreService,
  SacramentSubmission,
  SacramentType,
} from '../../../shared/services/firestore.service';

@Component({
  selector: 'app-sacraments',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './sacraments.html',
  styleUrls: ['./sacraments.scss'],
})
export class Sacraments implements OnInit {
  private firestoreService = inject(FirestoreService);
  private router = inject(Router);
  private cd = inject(ChangeDetectorRef);

  public submissions: SacramentSubmission[] = [];
  public filteredSubmissions: SacramentSubmission[] = [];
  public loading = true;
  public selectedType: SacramentType | 'all' = 'all';
  public searchTerm = '';

  public sacramentTypes: Array<{ value: SacramentType | 'all'; label: string }> = [
    { value: 'all', label: 'All Sacraments' },
    { value: 'baptism', label: 'Baptism' },
    { value: 'confirmation', label: 'Confirmation' },
    { value: 'holy-communion', label: 'First Communion' },
    { value: 'wedding', label: 'Wedding' },
    { value: 'anointing', label: 'Anointing of the Sick' },
    { value: 'consecration', label: 'Consecration' },
  ];

  async ngOnInit(): Promise<void> {
    await this.loadSubmissions();
  }

  async loadSubmissions(): Promise<void> {
    this.loading = true;
    try {
      this.submissions = await this.firestoreService.getAllSacramentSubmissions();
      this.applyFilters();
    } catch (error) {
      console.error('Error loading submissions:', error);
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

    // Filter by type
    if (this.selectedType !== 'all') {
      filtered = filtered.filter((s) => s.type === this.selectedType);
    }

    // Filter by search term
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter((s) => {
        const formDataStr = JSON.stringify(s.formData).toLowerCase();
        const typeStr = this.formatSacramentType(s.type).toLowerCase();
        return formDataStr.includes(term) || typeStr.includes(term);
      });
    }

    this.filteredSubmissions = filtered;
  }

  viewDetails(submission: SacramentSubmission): void {
    this.router.navigate(['/sacraments', submission.type, submission.id]);
  }

  formatSacramentType(type: SacramentType): string {
    return this.firestoreService.formatSacramentType(type);
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
