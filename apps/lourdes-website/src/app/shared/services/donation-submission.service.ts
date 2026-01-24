import { Injectable } from '@angular/core';
import { FirebaseService } from './firebase.service';
import { DocumentData } from 'firebase/firestore';

export interface DonationSubmission extends DocumentData {
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  formData: any;
  submittedAt: string;
  processedAt?: string;
  notes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DonationSubmissionService {
  private readonly COLLECTION_NAME = 'donations-submissions';

  constructor(private firebaseService: FirebaseService) {}

  /**
   * Submit a donation form
   */
  async submitForm(formData: any): Promise<string> {
    const submission: Partial<DonationSubmission> = {
      status: 'pending',
      formData,
      submittedAt: new Date().toISOString()
    };

    return await this.firebaseService.addDocument(this.COLLECTION_NAME, submission);
  }

  /**
   * Get a specific submission
   */
  async getSubmission(submissionId: string): Promise<DonationSubmission | null> {
    return await this.firebaseService.getDocument(this.COLLECTION_NAME, submissionId) as DonationSubmission | null;
  }

  /**
   * Get all submissions (optionally filter by status)
   */
  async getSubmissions(status?: DonationSubmission['status']): Promise<DonationSubmission[]> {
    const constraints = [];
    
    if (status) {
      constraints.push(this.firebaseService.where('status', '==', status));
    }
    
    constraints.push(this.firebaseService.orderBy('submittedAt', 'desc'));
    
    return await this.firebaseService.getDocuments(this.COLLECTION_NAME, constraints) as DonationSubmission[];
  }

  /**
   * Update submission status
   */
  async updateSubmissionStatus(
    submissionId: string, 
    status: DonationSubmission['status'],
    notes?: string
  ): Promise<void> {
    const updateData: Partial<DonationSubmission> = {
      status,
      processedAt: new Date().toISOString()
    };
    
    if (notes) {
      updateData.notes = notes;
    }
    
    await this.firebaseService.updateDocument(this.COLLECTION_NAME, submissionId, updateData);
  }

  /**
   * Delete a submission
   */
  async deleteSubmission(submissionId: string): Promise<void> {
    await this.firebaseService.deleteDocument(this.COLLECTION_NAME, submissionId);
  }
}
