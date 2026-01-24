import { Injectable } from '@angular/core';
import { FirebaseService } from './firebase.service';
import { DocumentData } from 'firebase/firestore';

export interface ContactUsSubmission extends DocumentData {
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  formData: any;
  submittedAt: string;
  processedAt?: string;
  notes?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ContactUsSubmissionService {
  private readonly COLLECTION_NAME = 'contact-us-submissions';

  constructor(private firebaseService: FirebaseService) {}

  /**
   * Submit a contact us form
   */
  async submitForm(formData: any): Promise<string> {
    const submission: Partial<ContactUsSubmission> = {
      status: 'pending',
      formData,
      submittedAt: new Date().toISOString(),
    };

    return await this.firebaseService.addDocument(
      this.COLLECTION_NAME,
      submission,
    );
  }

  /**
   * Get a specific submission
   */
  async getSubmission(
    submissionId: string,
  ): Promise<ContactUsSubmission | null> {
    return (await this.firebaseService.getDocument(
      this.COLLECTION_NAME,
      submissionId,
    )) as ContactUsSubmission | null;
  }

  /**
   * Get all submissions (optionally filter by status)
   */
  async getSubmissions(
    status?: ContactUsSubmission['status'],
  ): Promise<ContactUsSubmission[]> {
    const constraints = [];

    if (status) {
      constraints.push(this.firebaseService.where('status', '==', status));
    }

    constraints.push(this.firebaseService.orderBy('submittedAt', 'desc'));

    return (await this.firebaseService.getDocuments(
      this.COLLECTION_NAME,
      constraints,
    )) as ContactUsSubmission[];
  }

  /**
   * Update submission status
   */
  async updateSubmissionStatus(
    submissionId: string,
    status: ContactUsSubmission['status'],
    notes?: string,
  ): Promise<void> {
    const updateData: Partial<ContactUsSubmission> = {
      status,
      processedAt: new Date().toISOString(),
    };

    if (notes) {
      updateData.notes = notes;
    }

    await this.firebaseService.updateDocument(
      this.COLLECTION_NAME,
      submissionId,
      updateData,
    );
  }

  /**
   * Delete a submission
   */
  async deleteSubmission(submissionId: string): Promise<void> {
    await this.firebaseService.deleteDocument(
      this.COLLECTION_NAME,
      submissionId,
    );
  }
}
