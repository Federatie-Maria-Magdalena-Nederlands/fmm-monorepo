import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  FirestoreService,
  VolunteerSubmission,
} from '../../../shared/services/firestore.service';

@Component({
  selector: 'app-volunteer-detail',
  imports: [CommonModule, RouterModule],
  templateUrl: './volunteer-detail.html',
  styleUrls: ['./volunteer-detail.scss'],
})
export class VolunteerDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private firestoreService = inject(FirestoreService);
  private cd = inject(ChangeDetectorRef);

  public volunteer: VolunteerSubmission | null = null;
  public loading = true;

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      await this.loadVolunteer(id);
    }
  }

  async loadVolunteer(id: string): Promise<void> {
    this.loading = true;
    try {
      this.volunteer = await this.firestoreService.getVolunteerById(id);
      this.cd.detectChanges();
    } catch (error) {
      console.error('Error loading volunteer:', error);
    } finally {
      this.loading = false;
      this.cd.detectChanges();
    }
  }

  goBack(): void {
    this.router.navigate(['/volunteers']);
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
    if (!this.volunteer?.formData) return [];

    const formData = this.volunteer.formData;
    const groups = [];

    // Personal Information Group
    const personalFields = [
      'name',
      'lastName',
      'emailAddress',
      'phoneNumber',
    ];
    const personalEntries = this.getFieldsByKeys(formData, personalFields);
    if (personalEntries.length > 0) {
      groups.push({
        title: 'Personal Information',
        fields: personalEntries,
      });
    }

    // Volunteer Information Group
    const volunteerFields = [
      'message',
      'iWouldLikeToVolunteerFor',
    ];
    const volunteerEntries = this.getFieldsByKeys(formData, volunteerFields);
    if (volunteerEntries.length > 0) {
      groups.push({
        title: 'Volunteer Information',
        fields: volunteerEntries,
      });
    }

    // Add any remaining fields that weren't categorized
    const allDefinedFields = [...personalFields, ...volunteerFields];
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
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
  }

  isLongValue(value: string): boolean {
    return value.length > 100;
  }
}
