import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  FirestoreService,
  ContactUsSubmission,
} from '../../../shared/services/firestore.service';

@Component({
  selector: 'app-contact-us',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './contact-us.html',
  styleUrls: ['./contact-us.scss'],
})
export class ContactUs implements OnInit {
  private firestoreService = inject(FirestoreService);
  private router = inject(Router);
  private cd = inject(ChangeDetectorRef);

  public submissions: ContactUsSubmission[] = [];
  public filteredSubmissions: ContactUsSubmission[] = [];
  public loading = true;
  public searchTerm = '';

  async ngOnInit(): Promise<void> {
    await this.loadSubmissions();
  }

  async loadSubmissions(): Promise<void> {
    this.loading = true;
    try {
      this.submissions = await this.firestoreService.getAllContactUs();
      this.applyFilters();
    } catch (error) {
      console.error('Error loading contact us submissions:', error);
    } finally {
      this.loading = false;
      this.cd.detectChanges();
    }
  }

  onSearch(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.submissions];

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

  viewDetails(submission: ContactUsSubmission): void {
    this.router.navigate(['/contact-us', submission.id]);
  }

  formatDate(date: any): string {
    return this.firestoreService.formatDate(date);
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
