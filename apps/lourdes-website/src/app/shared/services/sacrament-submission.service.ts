import { Injectable } from '@angular/core';
import { FirebaseService } from './firebase.service';
import { DocumentData } from 'firebase/firestore';

export type SacramentType = 
  | 'mass-intentions'
  | 'donations'
  | 'baptism'
  | 'holy-communion'
  | 'confirmation'
  | 'wedding'
  | 'anointing'
  | 'consecration';

export interface SacramentSubmission extends DocumentData {
  type: SacramentType;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  formData: any;
  submittedAt: string;
  processedAt?: string;
  notes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SacramentSubmissionService {
  private readonly COLLECTION_NAME = 'sacrament-submissions';

  constructor(private firebaseService: FirebaseService) {}

  /**
   * Submit a sacrament form
   */
  async submitForm(type: SacramentType, formData: any): Promise<string> {
    const submission: Partial<SacramentSubmission> = {
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
  async getSubmission(submissionId: string): Promise<SacramentSubmission | null> {
    return await this.firebaseService.getDocument(this.COLLECTION_NAME, submissionId) as SacramentSubmission | null;
  }

  /**
   * Get all submissions (optionally filter by type and status)
   */
  async getSubmissions(type?: SacramentType, status?: SacramentSubmission['status']): Promise<SacramentSubmission[]> {
    const constraints = [];
    
    if (type) {
      constraints.push(this.firebaseService.where('type', '==', type));
    }
    
    if (status) {
      constraints.push(this.firebaseService.where('status', '==', status));
    }
    
    constraints.push(this.firebaseService.orderBy('submittedAt', 'desc'));
    
    return await this.firebaseService.getDocuments(this.COLLECTION_NAME, constraints) as SacramentSubmission[];
  }

  /**
   * Update submission status
   */
  async updateSubmissionStatus(
    submissionId: string, 
    status: SacramentSubmission['status'],
    notes?: string
  ): Promise<void> {
    const updateData: Partial<SacramentSubmission> = {
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
