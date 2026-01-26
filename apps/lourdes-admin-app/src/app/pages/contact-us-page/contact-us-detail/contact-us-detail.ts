import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  ContactUsSubmission,
  FirestoreService,
} from '../../../shared/services/firestore.service';

interface FieldGroup {
  title: string;
  fields: Array<{ key: string; value: string }>;
}

@Component({
  selector: 'app-contact-us-detail',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './contact-us-detail.html',
  styleUrls: ['./contact-us-detail.scss'],
})
export class ContactUsDetail implements OnInit {
  private firestoreService = inject(FirestoreService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cd = inject(ChangeDetectorRef);

  public submission: ContactUsSubmission | null = null;
  public loading = true;
  public submissionId = '';
  public notes = '';
  public showNotesEdit = false;
  public savingNotes = false;

  async ngOnInit(): Promise<void> {
    this.submissionId = this.route.snapshot.paramMap.get('id') || '';
    if (this.submissionId) {
      await this.loadSubmission();
    }
  }

  async loadSubmission(): Promise<void> {
    this.loading = true;
    try {
      this.submission = await this.firestoreService.getContactUsById(
        this.submissionId
      );
      this.notes = this.submission?.notes || '';
      this.cd.detectChanges();
    } catch (error) {
      console.error('Error loading contact us submission:', error);
      this.router.navigate(['/contact-us']);
    } finally {
      this.loading = false;
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
      await this.firestoreService.updateContactUsNotes(
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
    this.router.navigate(['/contact-us']);
  }

  formatDate(date: any): string {
    return this.firestoreService.formatDate(date);
  }

  getFormDataGroups(): FieldGroup[] {
    if (!this.submission?.formData) return [];

    const formData = this.submission.formData;

    return [
      {
        title: 'Contact Information',
        fields: [
          { key: 'Name', value: formData['name'] || 'N/A' },
          { key: 'Email', value: formData['email'] || 'N/A' },
          { key: 'Phone', value: formData['phone'] || 'N/A' },
          { key: 'Message', value: formData['message'] || 'N/A' },
        ],
      },
    ];
  }
}
