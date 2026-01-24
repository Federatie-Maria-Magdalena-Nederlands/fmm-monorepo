import { Injectable } from '@angular/core';
import { FirebaseService } from './firebase.service';
import { DocumentData } from 'firebase/firestore';

export type JoinUsType = 'volunteer' | 'church-member';

export interface JoinUsSubmission extends DocumentData {
  type: JoinUsType;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  formData: any;
  submittedAt: string;
  processedAt?: string;
  notes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class JoinUsSubmissionService {
  private readonly COLLECTION_NAME = 'join-us-submissions';

  constructor(private firebaseService: FirebaseService) {}

  /**
   * Submit a join-us form (volunteer or church member)
   */
  async submitForm(type: JoinUsType, formData: any): Promise<string> {
    const submission: Partial<JoinUsSubmission> = {
      type,
      status: 'pending',
      formData,
      submittedAt: new Date().toISOString()
    };

    return await this.firebaseService.addDocument(this.COLLECTION_NAME, submission);
  }

  /**
   * Get a specific submission
   */
  async getSubmission(submissionId: string): Promise<JoinUsSubmission | null> {
    return await this.firebaseService.getDocument(this.COLLECTION_NAME, submissionId) as JoinUsSubmission | null;
  }

  /**
   * Get all submissions (optionally filter by type and status)
   */
  async getSubmissions(type?: JoinUsType, status?: JoinUsSubmission['status']): Promise<JoinUsSubmission[]> {
    const constraints = [];
    
    if (type) {
      constraints.push(this.firebaseService.where('type', '==', type));
    }
    
    if (status) {
      constraints.push(this.firebaseService.where('status', '==', status));
    }
    
    constraints.push(this.firebaseService.orderBy('submittedAt', 'desc'));
    
    return await this.firebaseService.getDocuments(this.COLLECTION_NAME, constraints) as JoinUsSubmission[];
  }

  /**
   * Update submission status
   */
  async updateSubmissionStatus(
    submissionId: string, 
    status: JoinUsSubmission['status'],
    notes?: string
  ): Promise<void> {
    const updateData: Partial<JoinUsSubmission> = {
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
