import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  FirestoreService,
  VolunteerSubmission,
} from '../../../shared/services/firestore.service';
import jsPDF from 'jspdf';

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
  public processing = false;

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

  async approveSubmission(): Promise<void> {
    if (!this.volunteer || this.processing) return;

    this.processing = true;
    try {
      await this.firestoreService.updateVolunteerStatus(this.volunteer.id, 'approved');
      this.volunteer.status = 'approved';
      this.cd.detectChanges();
    } catch (error) {
      console.error('Error approving volunteer:', error);
    } finally {
      this.processing = false;
      this.cd.detectChanges();
    }
  }

  async rejectSubmission(): Promise<void> {
    if (!this.volunteer || this.processing) return;

    this.processing = true;
    try {
      await this.firestoreService.updateVolunteerStatus(this.volunteer.id, 'rejected');
      this.volunteer.status = 'rejected';
      this.cd.detectChanges();
    } catch (error) {
      console.error('Error rejecting volunteer:', error);
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

  sendEmail(): void {
    if (!this.volunteer?.formData) return;

    const email = this.volunteer.formData['email'] || this.volunteer.formData['emailAddress'];
    if (email) {
      // Open Gmail compose with the email address
      window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}`, '_blank');
    } else {
      console.error('No email address found in submission');
    }
  }

  downloadPDF(): void {
    if (!this.volunteer) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20;

    // Title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Volunteer Registration Details', pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;

    // Submission Info
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`ID: ${this.volunteer.id}`, 20, yPos);
    yPos += 7;
    doc.text(`Submitted: ${this.formatDate(this.volunteer.submittedAt)}`, 20, yPos);
    yPos += 7;
    doc.text(`Status: ${this.volunteer.status || 'pending'}`, 20, yPos);
    yPos += 15;

    // Form Data Groups
    const groups = this.getFormDataGroups();
    
    for (const group of groups) {
      // Check if we need a new page
      if (yPos > 260) {
        doc.addPage();
        yPos = 20;
      }

      // Group Title
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(group.title, 20, yPos);
      yPos += 10;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');

      for (const entry of group.fields) {
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

      yPos += 5; // Space between groups
    }

    // Notes if exists
    if (this.volunteer.notes) {
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
      const noteLines = doc.splitTextToSize(this.volunteer.notes, pageWidth - 40);
      doc.text(noteLines, 20, yPos);
    }

    // Save PDF
    doc.save(`volunteer-${this.volunteer.id}.pdf`);
  }
}
