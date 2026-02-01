import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import jsPDF from 'jspdf';
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

  async deleteSubmission(): Promise<void> {
    if (!this.submission || this.processing) return;

    // Confirm deletion
    const confirmed = confirm(
      'Are you sure you want to delete this member registration? This will also delete all associated files from storage. This action cannot be undone.'
    );

    if (!confirmed) return;

    this.processing = true;
    try {
      await this.firestoreService.deleteMember(this.submissionId);
      // Navigate back to the list after successful deletion
      this.router.navigate(['/members']);
    } catch (error) {
      console.error('Error deleting submission:', error);
      alert('Failed to delete submission. Please try again.');
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

  sendEmail(): void {
    if (!this.submission?.formData) return;

    const email = this.submission.formData['email'] || this.submission.formData['emailAddress'];
    if (email) {
      // Open Gmail compose with the email address
      window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}`, '_blank');
    } else {
      console.error('No email address found in submission');
    }
  }

  downloadPDF(): void {
    if (!this.submission) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - 2 * margin;
    let yPosition = margin;

    // Helper function to add text with wrapping and page overflow handling
    const addText = (text: string, fontSize: number = 10, isBold: boolean = false) => {
      if (isBold) {
        doc.setFont('helvetica', 'bold');
      } else {
        doc.setFont('helvetica', 'normal');
      }
      doc.setFontSize(fontSize);
      const lines = doc.splitTextToSize(text, maxWidth);
      
      for (const line of lines) {
        if (yPosition > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
        }
        doc.text(line, margin, yPosition);
        yPosition += fontSize * 0.5;
      }
    };

    // Title
    addText('Member Registration Details', 16, true);
    yPosition += 5;

    // Submission Info
    addText(`Application ID: ${this.submission.id}`, 10);
    yPosition += 2;
    addText(`Submitted At: ${this.formatDate(this.submission.submittedAt)}`, 10);
    yPosition += 2;
    addText(`Status: ${this.submission.status || 'pending'}`, 10);
    yPosition += 10;

    // Form Data Groups
    const groups = this.getFormDataGroups();
    for (const group of groups) {
      addText(group.title, 12, true);
      yPosition += 2;

      for (const field of group.fields) {
        if (field.value && field.value !== 'N/A') {
          addText(`${field.key}: ${field.value}`, 10);
          yPosition += 2;
        }
      }
      yPosition += 5;
    }

    // Notes
    if (this.submission.notes) {
      addText('Notes', 12, true);
      yPosition += 2;
      addText(this.submission.notes, 10);
    }

    // Save the PDF
    doc.save(`member-${this.submissionId}.pdf`);
  }
}
