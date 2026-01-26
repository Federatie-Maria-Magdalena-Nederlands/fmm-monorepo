import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  FirestoreService,
  DonationSubmission,
} from '../../../shared/services/firestore.service';

@Component({
  selector: 'app-donation-detail',
  imports: [CommonModule, RouterModule],
  templateUrl: './donation-detail.html',
  styleUrls: ['./donation-detail.scss'],
})
export class DonationDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private firestoreService = inject(FirestoreService);
  private cd = inject(ChangeDetectorRef);

  public donation: DonationSubmission | null = null;
  public loading = true;

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      await this.loadDonation(id);
    }
  }

  async loadDonation(id: string): Promise<void> {
    this.loading = true;
    try {
      this.donation = await this.firestoreService.getDonationById(id);
      this.cd.detectChanges();
    } catch (error) {
      console.error('Error loading donation:', error);
    } finally {
      this.loading = false;
      this.cd.detectChanges();
    }
  }

  goBack(): void {
    this.router.navigate(['/donations']);
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

  getFormDataGroups(): Array<{ title: string; fields: Array<{ key: string; value: any }> }> {
    if (!this.donation?.formData) return [];

    const formData = this.donation.formData;
    const groups = [];

    // Personal Information Group
    const personalFields = ['firstName', 'lastName'];
    const personalEntries = this.getFieldsByKeys(formData, personalFields);
    if (personalEntries.length > 0) {
      groups.push({
        title: 'Personal Information',
        fields: personalEntries,
      });
    }

    // Contact Information Group
    const contactFields = [
      'address1',
      'address2',
      'email',
      'phoneNumber',
    ];
    const contactEntries = this.getFieldsByKeys(formData, contactFields);
    if (contactEntries.length > 0) {
      groups.push({
        title: 'Contact Information',
        fields: contactEntries,
      });
    }

    // Donation Details Group
    const donationFields = [
      'donationAmount',
      'message',
    ];
    const donationEntries = this.getFieldsByKeys(formData, donationFields);
    if (donationEntries.length > 0) {
      groups.push({
        title: 'Donation Details',
        fields: donationEntries,
      });
    }

    // Payment Information Group
    const paymentFields = [
      'bankAccount',
      'agreement',
    ];
    const paymentEntries = this.getFieldsByKeys(formData, paymentFields);
    if (paymentEntries.length > 0) {
      groups.push({
        title: 'Payment Information',
        fields: paymentEntries,
      });
    }

    // Add any remaining fields that weren't categorized
    const allDefinedFields = [...personalFields, ...contactFields, ...donationFields, ...paymentFields];
    const remainingEntries: Array<{ key: string; value: any }> = [];
    Object.entries(formData).forEach(([key, value]) => {
      if (!allDefinedFields.includes(key)) {
        remainingEntries.push({
          key: this.formatFieldName(key),
          value: this.formatFieldValue(value),
        });
      }
    });

    if (remainingEntries.length > 0) {
      groups.push({
        title: 'Additional Information',
        fields: remainingEntries,
      });
    }

    return groups;
  }

  private getFieldsByKeys(
    formData: Record<string, any>,
    keys: string[]
  ): Array<{ key: string; value: any }> {
    const entries: Array<{ key: string; value: any }> = [];
    keys.forEach((key) => {
      if (formData.hasOwnProperty(key)) {
        entries.push({
          key: this.formatFieldName(key),
          value: this.formatFieldValue(formData[key]),
        });
      }
    });
    return entries;
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
