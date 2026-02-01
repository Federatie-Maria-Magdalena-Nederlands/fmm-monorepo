import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  FirestoreService,
  MassIntentionSubmission,
} from '../../shared/services/firestore.service';
import jsPDF from 'jspdf';

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
  public processing = false;

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

  async approveSubmission(): Promise<void> {
    if (!this.submission || this.processing) return;

    this.processing = true;
    try {
      await this.firestoreService.updateMassIntentionStatus(this.submission.id, 'approved');
      this.submission.status = 'approved';
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
      await this.firestoreService.updateMassIntentionStatus(this.submission.id, 'rejected');
      this.submission.status = 'rejected';
      this.cd.detectChanges();
    } catch (error) {
      console.error('Error rejecting submission:', error);
    } finally {
      this.processing = false;
      this.cd.detectChanges();
    }
  }

  async markComplete(): Promise<void> {
    if (!this.submission || this.processing) return;

    this.processing = true;
    try {
      await this.firestoreService.updateMassIntentionStatus(this.submission.id, 'completed');
      this.submission.status = 'completed';
      this.cd.detectChanges();
    } catch (error) {
      console.error('Error marking as complete:', error);
    } finally {
      this.processing = false;
      this.cd.detectChanges();
    }
  }

  async deleteSubmission(): Promise<void> {
    if (!this.submission || this.processing) return;

    // Confirm deletion
    const confirmed = confirm(
      'Are you sure you want to delete this mass intention submission? This will also delete all associated files from storage. This action cannot be undone.'
    );

    if (!confirmed) return;

    this.processing = true;
    try {
      await this.firestoreService.deleteMassIntention(this.submission.id);
      // Navigate back to the list after successful deletion
      this.router.navigate(['/mass-intentions']);
    } catch (error) {
      console.error('Error deleting submission:', error);
      alert('Failed to delete submission. Please try again.');
    } finally {
      this.processing = false;
      this.cd.detectChanges();
    }
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
      'proofOfPaymentUrl'
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

  sendEmail(): void {
    if (!this.submission?.formData) return;

    const email = this.submission.formData['email'];
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
    let yPos = 20;

    // Title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Mass Intention Details', pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;

    // Submission Info
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`ID: ${this.submission.id}`, 20, yPos);
    yPos += 7;
    doc.text(`Submitted: ${this.formatDate(this.submission.submittedAt)}`, 20, yPos);
    yPos += 7;
    doc.text(`Status: ${this.submission.status || 'pending'}`, 20, yPos);
    yPos += 15;

    // Form Data
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Request Information', 20, yPos);
    yPos += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    const entries = this.getFormDataEntries();
    for (const entry of entries) {
      // Skip URL fields as they are file references
      if (entry.key.toLowerCase().includes('url')) continue;

      // Check if we need a new page
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFont('helvetica', 'bold');
      doc.text(`${entry.key}:`, 20, yPos);
      yPos += 6;

      doc.setFont('helvetica', 'normal');
      const lines = doc.splitTextToSize(entry.value, pageWidth - 40);
      doc.text(lines, 20, yPos);
      yPos += (lines.length * 6) + 4;
    }

    // Notes if exists
    if (this.submission.notes) {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      yPos += 10;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Notes', 20, yPos);
      yPos += 10;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const noteLines = doc.splitTextToSize(this.submission.notes, pageWidth - 40);
      doc.text(noteLines, 20, yPos);
    }

    // Save PDF
    doc.save(`mass-intention-${this.submission.id}.pdf`);
  }
}
