import { Injectable } from '@angular/core';
import { FirebaseService } from './firebase.service';
import { DocumentData } from 'firebase/firestore';

export interface MassIntentionSubmission extends DocumentData {
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  formData: any;
  submittedAt: string;
  processedAt?: string;
  notes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MassIntentionSubmissionService {
  private readonly COLLECTION_NAME = 'mass-intentions-submissions';

  constructor(private firebaseService: FirebaseService) {}

  /**
   * Submit a mass intention form
   */
  async submitForm(formData: any): Promise<string> {
    const submission: Partial<MassIntentionSubmission> = {
      status: 'pending',
      formData,
      submittedAt: new Date().toISOString()
    };

    return await this.firebaseService.addDocument(this.COLLECTION_NAME, submission);
  }

  /**
   * Get a specific submission
   */
  async getSubmission(submissionId: string): Promise<MassIntentionSubmission | null> {
    return await this.firebaseService.getDocument(this.COLLECTION_NAME, submissionId) as MassIntentionSubmission | null;
  }

  /**
   * Get all submissions (optionally filter by status)
   */
  async getSubmissions(status?: MassIntentionSubmission['status']): Promise<MassIntentionSubmission[]> {
    const constraints = [];
    
    if (status) {
      constraints.push(this.firebaseService.where('status', '==', status));
    }
    
    constraints.push(this.firebaseService.orderBy('submittedAt', 'desc'));
    
    return await this.firebaseService.getDocuments(this.COLLECTION_NAME, constraints) as MassIntentionSubmission[];
  }

  /**
   * Update submission status
   */
  async updateSubmissionStatus(
    submissionId: string, 
    status: MassIntentionSubmission['status'],
    notes?: string
  ): Promise<void> {
    const updateData: Partial<MassIntentionSubmission> = {
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
