import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  orderBy,
  where,
  Timestamp,
  getFirestore,
} from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { environment } from '../../../environments/environment';

// Initialize Firebase app once
const firebaseApp = initializeApp(environment.firebase);

export type SacramentType =
  | 'baptism'
  | 'confirmation'
  | 'first-communion'
  | 'reconciliation'
  | 'marriage'
  | 'anointing'
  | 'holy-orders'
  | 'eucharist'
  | 'consecration'
  | 'wedding';

export interface SacramentSubmission {
  id: string;
  type: SacramentType;
  formData: Record<string, any>;
  submittedAt: Date | Timestamp;
  status?: 'pending' | 'approved' | 'rejected';
  notes?: string;
}

export interface MassIntentionSubmission {
  id: string;
  formData: Record<string, any>;
  submittedAt: Date | Timestamp;
  status?: 'pending' | 'approved' | 'rejected' | 'completed';
  processedAt?: Date | Timestamp;
  notes?: string;
}

@Injectable({
  providedIn: 'root',
})
export class FirestoreService {
  private db: Firestore;
  private readonly COLLECTION_NAME = 'sacrament-submissions';
  private readonly MASS_INTENTIONS_COLLECTION = 'mass-intentions-submissions';

  constructor() {
    this.db = getFirestore(firebaseApp);
  }

  /**
   * Get all submissions from a specific sacrament type
   */
  async getSubmissionsByType(type: SacramentType): Promise<SacramentSubmission[]> {
    const collectionRef = collection(this.db, this.COLLECTION_NAME);
    const q = query(
      collectionRef,
      where('type', '==', type),
      orderBy('submittedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const submissions: SacramentSubmission[] = [];

    querySnapshot.forEach((docSnapshot) => {
      submissions.push({
        id: docSnapshot.id,
        ...docSnapshot.data(),
      } as SacramentSubmission);
    });

    return submissions;
  }

  /**
   * Get all submissions from the sacrament-submissions collection
   */
  async getAllSacramentSubmissions(): Promise<SacramentSubmission[]> {
    const collectionRef = collection(this.db, this.COLLECTION_NAME);
    const q = query(collectionRef, orderBy('submittedAt', 'desc'));
    
    const querySnapshot = await getDocs(q);
    const submissions: SacramentSubmission[] = [];

    querySnapshot.forEach((docSnapshot) => {
      submissions.push({
        id: docSnapshot.id,
        ...docSnapshot.data(),
      } as SacramentSubmission);
    });

    return submissions;
  }

  /**
   * Get a single submission by ID
   */
  async getSubmissionById(
    type: SacramentType,
    id: string
  ): Promise<SacramentSubmission | null> {
    const docRef = doc(this.db, this.COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as SacramentSubmission;
    }

    return null;
  }

  /**
   * Find a submission by ID
   */
  async findSubmissionById(id: string): Promise<SacramentSubmission | null> {
    const docRef = doc(this.db, this.COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as SacramentSubmission;
    }

    return null;
  }

  /**
   * Format Firestore Timestamp to readable date string
   */
  formatDate(date: Date | Timestamp): string {
    const d = date instanceof Timestamp ? date.toDate() : new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /**
   * Format sacrament type for display
   */
  formatSacramentType(type: SacramentType): string {
    return type
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  // === MASS INTENTIONS METHODS ===

  /**
   * Get all mass intention submissions
   */
  async getAllMassIntentions(): Promise<MassIntentionSubmission[]> {
    const collectionRef = collection(this.db, this.MASS_INTENTIONS_COLLECTION);
    const q = query(collectionRef, orderBy('submittedAt', 'desc'));
    
    const querySnapshot = await getDocs(q);
    const submissions: MassIntentionSubmission[] = [];

    querySnapshot.forEach((docSnapshot) => {
      submissions.push({
        id: docSnapshot.id,
        ...docSnapshot.data(),
      } as MassIntentionSubmission);
    });

    return submissions;
  }

  /**
   * Get a single mass intention by ID
   */
  async getMassIntentionById(id: string): Promise<MassIntentionSubmission | null> {
    const docRef = doc(this.db, this.MASS_INTENTIONS_COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as MassIntentionSubmission;
    }

    return null;
  }

  /**
   * Get mass intentions by status
   */
  async getMassIntentionsByStatus(status: string): Promise<MassIntentionSubmission[]> {
    const collectionRef = collection(this.db, this.MASS_INTENTIONS_COLLECTION);
    const q = query(
      collectionRef,
      where('status', '==', status),
      orderBy('submittedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const submissions: MassIntentionSubmission[] = [];

    querySnapshot.forEach((docSnapshot) => {
      submissions.push({
        id: docSnapshot.id,
        ...docSnapshot.data(),
      } as MassIntentionSubmission);
    });

    return submissions;
  }
}
