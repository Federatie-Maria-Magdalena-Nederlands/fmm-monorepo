import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  FirestoreService,
  MassIntentionSubmission,
} from '../../shared/services/firestore.service';

@Component({
  selector: 'app-mass-intention-detail',
  imports: [CommonModule, RouterModule],
  templateUrl: './mass-intention-detail.html',
  styleUrls: ['./mass-intention-detail.scss'],
})
export class MassIntentionDetail implements OnInit {
  private firestoreService = inject(FirestoreService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cd = inject(ChangeDetectorRef);

  public submission: MassIntentionSubmission | null = null;
  public loading = true;
  public error = false;

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.error = true;
      this.loading = false;
      return;
    }

    await this.loadSubmission(id);
  }

  async loadSubmission(id: string): Promise<void> {
    this.loading = true;
    try {
      this.submission = await this.firestoreService.getMassIntentionById(id);
      if (!this.submission) {
        this.error = true;
      }
    } catch (error) {
      console.error('Error loading mass intention:', error);
      this.error = true;
    } finally {
      this.loading = false;
      this.cd.detectChanges();
    }
  }

  goBack(): void {
    this.router.navigate(['/mass-intentions']);
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

  // Get form data entries as array for display in the correct order
  getFormDataEntries(): Array<{ key: string; value: any }> {
    if (!this.submission?.formData) return [];
    
    // Define the desired field order based on the form
    const fieldOrder = [
      'firstName',
      'lastName',
      'email',
      'phoneNumber',
      'desiredDate',
      'massIntention',
      'moneyTransferred',
      'proofOfPayment',
    ];

    const formData = this.submission.formData;
    const orderedEntries: Array<{ key: string; value: any }> = [];

    // Add fields in the defined order
    fieldOrder.forEach((fieldKey) => {
      if (formData.hasOwnProperty(fieldKey)) {
        orderedEntries.push({
          key: this.formatFieldName(fieldKey),
          value: this.formatFieldValue(formData[fieldKey]),
        });
      }
    });

    // Add any remaining fields that weren't in the defined order
    Object.entries(formData).forEach(([key, value]) => {
      if (!fieldOrder.includes(key)) {
        orderedEntries.push({
          key: this.formatFieldName(key),
          value: this.formatFieldValue(value),
        });
      }
    });

    return orderedEntries;
  }

  formatFieldName(key: string): string {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  }

  formatFieldValue(value: any): string {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
  }

  isLongValue(value: string): boolean {
    return value.length > 100;
  }
}
