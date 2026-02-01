import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  FirestoreService,
  SacramentSubmission,
  SacramentType,
} from '../../../shared/services/firestore.service';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-sacrament-detail',
  imports: [CommonModule, RouterModule],
  templateUrl: './sacrament-detail.html',
  styleUrls: ['./sacrament-detail.scss'],
})
export class SacramentDetail implements OnInit {
  private firestoreService = inject(FirestoreService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cd = inject(ChangeDetectorRef);

  public submission: SacramentSubmission | null = null;
  public loading = true;
  public error = false;
  public processing = false;

  async ngOnInit(): Promise<void> {
    const type = this.route.snapshot.paramMap.get('type') as SacramentType;
    const id = this.route.snapshot.paramMap.get('id');

    if (!type || !id) {
      this.error = true;
      this.loading = false;
      return;
    }

    await this.loadSubmission(type, id);
  }

  async loadSubmission(type: SacramentType, id: string): Promise<void> {
    this.loading = true;
    try {
      this.submission = await this.firestoreService.getSubmissionById(type, id);
      if (!this.submission) {
        this.error = true;
      }
    } catch (error) {
      console.error('Error loading submission:', error);
      this.error = true;
    } finally {
      this.loading = false;
      this.cd.detectChanges();
    }
  }

  goBack(): void {
    this.router.navigate(['/sacraments']);
  }

  async approveSubmission(): Promise<void> {
    if (!this.submission || this.processing) return;

    this.processing = true;
    try {
      await this.firestoreService.updateSacramentStatus(this.submission.id, 'approved');
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
      await this.firestoreService.updateSacramentStatus(this.submission.id, 'rejected');
      this.submission.status = 'rejected';
      this.cd.detectChanges();
    } catch (error) {
      console.error('Error rejecting submission:', error);
    } finally {
      this.processing = false;
      this.cd.detectChanges();
    }
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

  // Get grouped form data entries for display
  getFormDataGroups(): Array<{ title: string; fields: Array<{ key: string; value: any }> }> {
    if (!this.submission?.formData) return [];

    const type = this.submission.type;

    // Define field groupings based on sacrament type
    if (type === 'anointing') {
      return this.getAnointingGroups();
    }

    if (type === 'consecration') {
      return this.getConsecrationGroups();
    }

    if (type === 'wedding') {
      return this.getWeddingGroups();
    }

    if (type === 'confirmation') {
      return this.getConfirmationGroups();
    }

    if (type === 'baptism') {
      return this.getBaptismGroups();
    }

    if (type === 'holy-communion') {
      return this.getFirstCommunionGroups();
    }

    // Default: return all fields in a single group
    return [
      {
        title: 'Submission Information',
        fields: Object.entries(this.submission.formData).map(([key, value]) => ({
          key: this.formatFieldName(key),
          value: this.formatFieldValue(value),
        })),
      },
    ];
  }

  private getAnointingGroups(): Array<{ title: string; fields: Array<{ key: string; value: any }> }> {
    if (!this.submission?.formData) return [];

    const formData = this.submission.formData;
    const groups = [];

    // Sender Group
    const senderFields = [
      'senderName',
      'senderLastName',
      'senderEmail',
      'senderPhone',
    ];
    const senderEntries = this.getFieldsByKeys(formData, senderFields);
    if (senderEntries.length > 0) {
      groups.push({
        title: 'Sender',
        fields: senderEntries,
      });
    }

    // Recipient Group
    const recipientFields = [
      'recipientName',
      'recipientFirstName',
      'recipientSurname',
      'recipientAddress',
      'recipientPostalCity',
      'recipientDOB',
    ];
    const recipientEntries = this.getFieldsByKeys(formData, recipientFields);
    if (recipientEntries.length > 0) {
      groups.push({
        title: 'Recipient Information',
        fields: recipientEntries,
      });
    }

    // Privacy Group
    const privacyFields = ['privacyAgreement'];
    const privacyEntries = this.getFieldsByKeys(formData, privacyFields);
    if (privacyEntries.length > 0) {
      groups.push({
        title: 'Privacy',
        fields: privacyEntries,
      });
    }

    // Add any remaining fields that weren't categorized
    const allDefinedFields = [...senderFields, ...recipientFields, ...privacyFields];
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

  private getConsecrationGroups(): Array<{ title: string; fields: Array<{ key: string; value: any }> }> {
    if (!this.submission?.formData) return [];

    const formData = this.submission.formData;
    const groups = [];

    // Personal Information Group
    const personalInfoFields = [
      'name',
      'lastName',
      'mobilePhone',
      'emailAddress',
    ];
    const personalInfoEntries = this.getFieldsByKeys(formData, personalInfoFields);
    if (personalInfoEntries.length > 0) {
      groups.push({
        title: 'Personal Information',
        fields: personalInfoEntries,
      });
    }

    // Privacy Group
    const privacyFields = ['privacyAgreement'];
    const privacyEntries = this.getFieldsByKeys(formData, privacyFields);
    if (privacyEntries.length > 0) {
      groups.push({
        title: 'Privacy',
        fields: privacyEntries,
      });
    }

    // Add any remaining fields that weren't categorized
    const allDefinedFields = [...personalInfoFields, ...privacyFields];
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

  private getWeddingGroups(): Array<{ title: string; fields: Array<{ key: string; value: any }> }> {
    if (!this.submission?.formData) return [];

    const formData = this.submission.formData;
    const groups = [];

    // Bride Group
    const brideFields = [
      'brideName',
      'brideLastName',
      'bridePhone',
      'brideEmail',
      'brideDOB',
      'bridePlaceOfBirth',
      'brideAddress',
      'bridePostalCity',
    ];
    const brideEntries = this.getFieldsByKeys(formData, brideFields);
    if (brideEntries.length > 0) {
      groups.push({
        title: 'Bride',
        fields: brideEntries,
      });
    }

    // Groom Group
    const groomFields = [
      'groomName',
      'groomSurname',
      'groomPhone',
      'groomEmail',
      'groomDOB',
      'groomAddress',
      'groomPostalCity',
      'groomNationality',
      'groomFatherName',
      'groomMotherName',
      'godparentsName',
      'godparentsSurname',
      'godparentsAddress',
      'godparentsPostalCity',
      'godparentsPhone',
      'godparentsDOB',
      'godparentsCatholic'
    ];
    const groomEntries = this.getFieldsByKeys(formData, groomFields);
    if (groomEntries.length > 0) {
      groups.push({
        title: 'Groom',
        fields: groomEntries,
      });
    }

    // Privacy Group
    const privacyFields = ['privacyAgreement'];
    const privacyEntries = this.getFieldsByKeys(formData, privacyFields);
    if (privacyEntries.length > 0) {
      groups.push({
        title: 'Privacy',
        fields: privacyEntries,
      });
    }

    // Add any remaining fields that weren't categorized
    const allDefinedFields = [...brideFields, ...groomFields, ...privacyFields];
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

  private getConfirmationGroups(): Array<{ title: string; fields: Array<{ key: string; value: any }> }> {
    if (!this.submission?.formData) return [];

    const formData = this.submission.formData;
    const groups = [];

    // Confirmand Group
    const confirmandFields = [
      'confirmandName',
      'confirmandSurname',
      'confirmandFirstName',
      'confirmandDOB',
      'confirmandGender',
      'confirmandNationality',
      'confirmandBaptized',
      'confirmandBaptismDate',
      'confirmandBaptismPlace',
      'confirmandParishName'
      ,
    ];
    const confirmandEntries = this.getFieldsByKeys(formData, confirmandFields);
    if (confirmandEntries.length > 0) {
      groups.push({
        title: 'Confirmand Information',
        fields: confirmandEntries,
      });
    }

    // Mother's Information Group
    const motherFields = [
      'motherFirstNames',
      'motherSurname',
      'motherDOB',
      'motherPlaceOfBirth',
      'motherBaptized',
      'motherBaptismDate',
      'motherBaptismPlace',
      'motherNationality',
      'motherAddress',
      'motherPostalCity',
      'motherPhone',
      'motherEmail',
    ];
    const motherEntries = this.getFieldsByKeys(formData, motherFields);
    if (motherEntries.length > 0) {
      groups.push({
        title: "Mother's Information",
        fields: motherEntries,
      });
    }

    // Father's Information Group
    const fatherFields = [
      'fatherFirstNames',
      'fatherSurname',
      'fatherDOB',
      'fatherPlaceOfBirth',
      'fatherBaptized',
      'fatherBaptismDate',
      'fatherNationality',
      'fatherAddress',
      'fatherPostalCity',
      'fatherPhone',
      'fatherEmail',
    ];
    const fatherEntries = this.getFieldsByKeys(formData, fatherFields);
    if (fatherEntries.length > 0) {
      groups.push({
        title: "Father's Information",
        fields: fatherEntries,
      });
    }

    // Sponsor Information Group
    const sponsorFields = [
      'sponsorName',
      'sponsorSurname',
      'sponsorDOB',
      'sponsorPhone',
      'sponsorAddress',
      'sponsorPostalCity',
      'sponsorCatholic',
    ];
    const sponsorEntries = this.getFieldsByKeys(formData, sponsorFields);
    if (sponsorEntries.length > 0) {
      groups.push({
        title: 'Sponsor Information',
        fields: sponsorEntries,
      });
    }

    // Privacy Group
    const privacyFields = ['privacyAgreement'];
    const privacyEntries = this.getFieldsByKeys(formData, privacyFields);
    if (privacyEntries.length > 0) {
      groups.push({
        title: 'Privacy',
        fields: privacyEntries,
      });
    }

    // fileGroups
    const fileFiles = ['confirmandCertificateUrl', 'motherCertificateUrl', 'fatherCertificateUrl', 'sponsorCertificateUrl'];
    const fileEntries = this.getFieldsByKeys(formData, fileFiles);
    if (fileEntries.length > 0) {
      groups.push({
        title: 'Files',
        fields: fileEntries,
      });
    }

    // Add any remaining fields that weren't categorized
    const allDefinedFields = [...confirmandFields, ...motherFields, ...fatherFields, ...sponsorFields, ...privacyFields, ...fileFiles];
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

  private getBaptismGroups(): Array<{ title: string; fields: Array<{ key: string; value: any }> }> {
    if (!this.submission?.formData) return [];

    const formData = this.submission.formData;
    const groups = [];

    // Sender Group
    const senderFields = [
      'senderFirstName',
      'senderLastName',
      'senderPhone',
      'senderEmail',
    ];
    const senderEntries = this.getFieldsByKeys(formData, senderFields);
    if (senderEntries.length > 0) {
      groups.push({
        title: 'Sender',
        fields: senderEntries,
      });
    }

    // Recipient Information Group
    const recipientFields = [
      'sacramentType',
      'recipientName',
      'recipientSurname',
      'recipientFirstName',
      'recipientAddress',
      'recipientPostalCity',
      'recipientDOB',
      'recipientPlaceOfBirth',
      'recipientNationality',
    ];
    const recipientEntries = this.getFieldsByKeys(formData, recipientFields);
    if (recipientEntries.length > 0) {
      groups.push({
        title: 'Recipient Information',
        fields: recipientEntries,
      });
    }

    // Parents Information Group
    const parentsFields = [
      'motherName',
      'fatherName',
      'fatherSurname',
    ];
    const parentsEntries = this.getFieldsByKeys(formData, parentsFields);
    if (parentsEntries.length > 0) {
      groups.push({
        title: 'Parents Information',
        fields: parentsEntries,
      });
    }

    // Godparents Information Group
    const godparentsFields = [
      'godparentsName',
      'godparentsSurname',
      'godparentsDOB',
      'godparentsPhone',
      'godparentsAddress',
      'godparentsPostalCity',
      'godparentsCatholic',
    ];
    const godparentsEntries = this.getFieldsByKeys(formData, godparentsFields);
    if (godparentsEntries.length > 0) {
      groups.push({
        title: 'Godparents Information',
        fields: godparentsEntries,
      });
    }

    // Date & Privacy Group
    const datePrivacyFields = [
      'privacyAgreement',
      'baptismDate',
    ];
    const datePrivacyEntries = this.getFieldsByKeys(formData, datePrivacyFields);
    if (datePrivacyEntries.length > 0) {
      groups.push({
        title: 'Date & Privacy',
        fields: datePrivacyEntries,
      });
    }

    // Add any remaining fields that weren't categorized
    const allDefinedFields = [...senderFields, ...recipientFields, ...parentsFields, ...godparentsFields, ...datePrivacyFields];
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

  private getFirstCommunionGroups(): Array<{ title: string; fields: Array<{ key: string; value: any }> }> {
    if (!this.submission?.formData) return [];

    const formData = this.submission.formData;
    const groups = [];

    // Communicant Information Group
    const communicantFields = [
      'communicantName',
      'communicantSurname',
      'communicantFirstName',
      'communicantDOB',
      'communicantGender',
      'communicantNationality',
      'communicantBaptized',
      'communicantBaptismDate',
      'communicantBaptismPlace',
    ];
    const communicantEntries = this.getFieldsByKeys(formData, communicantFields);
    if (communicantEntries.length > 0) {
      groups.push({
        title: 'Communicant Information',
        fields: communicantEntries,
      });
    }

    // Mother's Information Group
    const motherFields = [
      'motherSurname',
      'motherFirstNames',
      'motherDOB',
      'motherPlaceOfBirth',
      'motherBaptized',
      'motherBaptismDate',
      'motherBaptismPlace',
      'motherNationality',
      'motherAddress',
      'motherPostalCity',
      'motherPhone',
      'motherEmail',
    ];
    const motherEntries = this.getFieldsByKeys(formData, motherFields);
    if (motherEntries.length > 0) {
      groups.push({
        title: "Mother's Information",
        fields: motherEntries,
      });
    }

    // Father's Information Group
    const fatherFields = [
      'fatherSurname',
      'fatherFirstNames',
      'fatherEmail',
      'fatherDOB',
      'fatherPlaceOfBirth',
      'fatherBaptized',
      'fatherBaptismDate',
      'fatherNationality',
      'fatherAddress',
      'fatherPostalCity',
      'fatherPhone',
      'fatherEmail',
    ];
    const fatherEntries = this.getFieldsByKeys(formData, fatherFields);
    if (fatherEntries.length > 0) {
      groups.push({
        title: "Father's Information",
        fields: fatherEntries,
      });
    }

    // Godparents Information Group
    const godparentsFields = [
      'godparentsName',
      'godparentsSurname',
      'godparentsDOB',
      'godparentsPhone',
      'godparentsAddress',
      'godparentsPostalCity',
      'godparentsCatholic',
    ];
    const godparentsEntries = this.getFieldsByKeys(formData, godparentsFields);
    if (godparentsEntries.length > 0) {
      groups.push({
        title: 'Godparents Information',
        fields: godparentsEntries,
      });
    }

    // Privacy Group
    const privacyFields = [
      'doYouAgreeWithOurParishsPrivacyPolicy',
      'newField',
    ];
    const privacyEntries = this.getFieldsByKeys(formData, privacyFields);
    if (privacyEntries.length > 0) {
      groups.push({
        title: 'Privacy',
        fields: privacyEntries,
      });
    }

        // fileGroups
    const fileFiles = ['confirmandCertificateUrl', 'motherCertificateUrl', 'fatherCertificateUrl', 'sponsorCertificateUrl', 'godparentsCertificateUrl'];
    const fileEntries = this.getFieldsByKeys(formData, fileFiles);
    if (fileEntries.length > 0) {
      groups.push({
        title: 'Files',
        fields: fileEntries,
      });
    }

    // Add any remaining fields that weren't categorized
    const allDefinedFields = [...communicantFields, ...motherFields, ...fatherFields, ...godparentsFields, ...privacyFields, ...fileFiles];
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

  // Get form data entries as array for display (legacy method, kept for compatibility)
  getFormDataEntries(): Array<{ key: string; value: any }> {
    if (!this.submission?.formData) return [];
    
    return Object.entries(this.submission.formData).map(([key, value]) => ({
      key: this.formatFieldName(key),
      value: this.formatFieldValue(value),
    }));
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

    // Try multiple possible email field names
    const email = this.submission.formData['email'] || 
                  this.submission.formData['emailAddress'] || 
                  this.submission.formData['senderEmail'];
    
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
    doc.text(`${this.formatSacramentType(this.submission.type)} Details`, pageWidth / 2, yPos, { align: 'center' });
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
    if (this.submission.notes) {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      yPos += 10;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Admin Notes', 20, yPos);
      yPos += 10;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const noteLines = doc.splitTextToSize(this.submission.notes, pageWidth - 40);
      doc.text(noteLines, 20, yPos);
    }

    // Save PDF
    doc.save(`${this.submission.type}-${this.submission.id}.pdf`);
  }
}
