import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  MemberSubmission,
  FirestoreService,
} from '../../../shared/services/firestore.service';

interface FieldGroup {
  title: string;
  fields: Array<{ key: string; value: string }>;
}

@Component({
  selector: 'app-member-detail',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './member-detail.html',
  styleUrls: ['./member-detail.scss'],
})
export class MemberDetail implements OnInit {
  private firestoreService = inject(FirestoreService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cd = inject(ChangeDetectorRef);

  public submission: MemberSubmission | null = null;
  public loading = true;
  public submissionId = '';
  public notes = '';
  public showNotesEdit = false;
  public savingNotes = false;
  public processing = false;

  async ngOnInit(): Promise<void> {
    this.submissionId = this.route.snapshot.paramMap.get('id') || '';
    if (this.submissionId) {
      await this.loadSubmission();
    }
  }

  async loadSubmission(): Promise<void> {
    this.loading = true;
    try {
      this.submission = await this.firestoreService.getMemberById(
        this.submissionId
      );
      this.notes = this.submission?.notes || '';
      this.cd.detectChanges();
    } catch (error) {
      console.error('Error loading member submission:', error);
      this.router.navigate(['/members']);
    } finally {
      this.loading = false;
      this.cd.detectChanges();
    }
  }

  async approveSubmission(): Promise<void> {
    if (!this.submission || this.processing) return;

    this.processing = true;
    try {
      await this.firestoreService.updateMemberStatus(this.submissionId, 'approved');
      this.submission.status = 'approved';
      this.submission.processedAt = new Date();
      this.cd.detectChanges();
    } catch (error) {
      console.error('Error approving submission:', error);
    } finally {
      this.processing = false;
      this.cd.detectChanges();
    }
  }

  async rejectSubmission(): Promise<void> {
    if (!this.submission || this.processing) return;

    this.processing = true;
    try {
      await this.firestoreService.updateMemberStatus(this.submissionId, 'rejected');
      this.submission.status = 'rejected';
      this.submission.processedAt = new Date();
      this.cd.detectChanges();
    } catch (error) {
      console.error('Error rejecting submission:', error);
    } finally {
      this.processing = false;
      this.cd.detectChanges();
    }
  }

  toggleNotesEdit(): void {
    this.showNotesEdit = !this.showNotesEdit;
  }

  async saveNotes(): Promise<void> {
    if (!this.submission) return;

    this.savingNotes = true;
    try {
      await this.firestoreService.updateMemberNotes(
        this.submissionId,
        this.notes
      );
      this.submission.notes = this.notes;
      this.showNotesEdit = false;
      this.cd.detectChanges();
    } catch (error) {
      console.error('Error saving notes:', error);
    } finally {
      this.savingNotes = false;
      this.cd.detectChanges();
    }
  }

  cancelNotesEdit(): void {
    this.notes = this.submission?.notes || '';
    this.showNotesEdit = false;
  }

  backToList(): void {
    this.router.navigate(['/members']);
  }

  formatDate(date: any): string {
    return this.firestoreService.formatDate(date);
  }

  getStatusBadgeClass(status?: string): string {
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

  getFormDataGroups(): FieldGroup[] {
    if (!this.submission?.formData) return [];

    const formData = this.submission.formData;

    return [
      {
        title: 'Personal Information',
        fields: [
          { key: 'Name', value: formData['name'] || 'N/A' },
          { key: 'Last Name', value: formData['lastName'] || 'N/A' },
          { key: 'Gender', value: formData['gender'] || 'N/A' },
          { key: 'Email Address', value: formData['email'] || formData['emailAddress'] || 'N/A' },
          { key: 'Phone Number', value: formData['phone'] || formData['phoneNumber'] || 'N/A' },
        ],
      },
      {
        title: 'Address Information',
        fields: [
          { key: 'Address', value: formData['address'] || 'N/A' },
          { key: 'Postal Code and City', value: formData['postalCodeCity'] || formData['postalCode'] || 'N/A' },
          { key: 'Main Resident', value: formData['mainResident'] || 'N/A' },
        ],
      },
      {
        title: 'Religious Information',
        fields: [
          { key: 'Baptized Catholic', value: formData['baptizedCatholic'] || 'N/A' },
        ],
      },
      {
        title: 'Marital Information',
        fields: [
          { key: 'Marital Status', value: formData['maritalStatus'] || 'N/A' },
          { key: 'Date of Wedding', value: formData['dateOfWedding'] || 'N/A' },
          { key: 'Widowed Since', value: formData['widowedSince'] || 'N/A' },
          { key: 'Date of Dissolution', value: formData['dateOfDissolution'] || 'N/A' },
        ],
      },
      {
        title: 'Spouse Information',
        fields: [
          { key: 'Spouse Surname', value: formData['spouseSurname'] || 'N/A' },
          { key: 'Spouse First Names', value: formData['spouseFirstNames'] || 'N/A' },
          { key: 'Date of Birth', value: formData['spouseDateOfBirth'] || 'N/A' },
          { key: 'Place of Birth', value: formData['spousePlaceOfBirth'] || 'N/A' },
        ],
      },
      {
        title: 'Additional Information',
        fields: [
          { key: 'Family Members', value: formData['familyMembers'] || 'N/A' },
          { key: 'Questions/Comments', value: formData['questions'] || formData['comments'] || 'N/A' },
        ],
      },
    ];
  }

  isLongValue(value: string): boolean {
    return value.length > 100;
  }
}
