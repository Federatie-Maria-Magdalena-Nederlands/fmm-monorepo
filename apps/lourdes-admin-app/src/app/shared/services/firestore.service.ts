import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
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
  | 'mass-intentions'
  | 'donations'
  | 'baptism'
  | 'holy-communion'
  | 'confirmation'
  | 'wedding'
  | 'anointing'
  | 'consecration';

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

export interface DonationSubmission {
  id: string;
  formData: Record<string, any>;
  submittedAt: Date | Timestamp;
  status?: 'pending' | 'approved' | 'rejected';
  processedAt?: Date | Timestamp;
  notes?: string;
}

export interface VolunteerSubmission {
  id: string;
  formData: Record<string, any>;
  submittedAt: Date | Timestamp;
  status?: 'pending' | 'approved' | 'rejected';
  processedAt?: Date | Timestamp;
  notes?: string;
}

export interface ContactUsSubmission {
  id: string;
  formData: Record<string, any>;
  submittedAt: Date | Timestamp;
  notes?: string;
}

export interface MemberSubmission {
  id: string;
  formData: Record<string, any>;
  submittedAt: Date | Timestamp;
  status?: 'pending' | 'approved' | 'rejected';
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
  private readonly DONATIONS_COLLECTION = 'donations-submissions';
  private readonly VOLUNTEERS_COLLECTION = 'join-us-submissions';
  private readonly CONTACT_US_COLLECTION = 'contact-us-submissions';
  private readonly MEMBERS_COLLECTION = 'members-submissions';

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

  /**
   * Get all donation submissions
   */
  async getAllDonations(): Promise<DonationSubmission[]> {
    const collectionRef = collection(this.db, this.DONATIONS_COLLECTION);
    const q = query(collectionRef, orderBy('submittedAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const submissions: DonationSubmission[] = [];

    querySnapshot.forEach((docSnapshot) => {
      submissions.push({
        id: docSnapshot.id,
        ...docSnapshot.data(),
      } as DonationSubmission);
    });

    return submissions;
  }

  /**
   * Get a single donation by ID
   */
  async getDonationById(id: string): Promise<DonationSubmission | null> {
    const docRef = doc(this.db, this.DONATIONS_COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as DonationSubmission;
    }

    return null;
  }

  /**
   * Get donations by status
   */
  async getDonationsByStatus(status: string): Promise<DonationSubmission[]> {
    const collectionRef = collection(this.db, this.DONATIONS_COLLECTION);
    const q = query(
      collectionRef,
      where('status', '==', status),
      orderBy('submittedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const submissions: DonationSubmission[] = [];

    querySnapshot.forEach((docSnapshot) => {
      submissions.push({
        id: docSnapshot.id,
        ...docSnapshot.data(),
      } as DonationSubmission);
    });

    return submissions;
  }

  /**
   * Get all volunteer submissions
   */
  async getAllVolunteers(): Promise<VolunteerSubmission[]> {
    const collectionRef = collection(this.db, this.VOLUNTEERS_COLLECTION);
    const q = query(
      collectionRef,
      where('type', '==', 'volunteer')
    );
    const querySnapshot = await getDocs(q);
    const submissions: VolunteerSubmission[] = [];

    querySnapshot.forEach((docSnapshot) => {
      submissions.push({
        id: docSnapshot.id,
        ...docSnapshot.data(),
      } as VolunteerSubmission);
    });

    // Sort in memory by submittedAt desc
    return submissions.sort((a, b) => {
      const dateA = a.submittedAt instanceof Timestamp ? a.submittedAt.toMillis() : new Date(a.submittedAt).getTime();
      const dateB = b.submittedAt instanceof Timestamp ? b.submittedAt.toMillis() : new Date(b.submittedAt).getTime();
      return dateB - dateA;
    });
  }

  /**
   * Get a single volunteer by ID
   */
  async getVolunteerById(id: string): Promise<VolunteerSubmission | null> {
    const docRef = doc(this.db, this.VOLUNTEERS_COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as VolunteerSubmission;
    }

    return null;
  }

  /**
   * Get volunteers by status
   */
  async getVolunteersByStatus(status: string): Promise<VolunteerSubmission[]> {
    const collectionRef = collection(this.db, this.VOLUNTEERS_COLLECTION);
    const q = query(
      collectionRef,
      where('status', '==', status),
      orderBy('submittedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const submissions: VolunteerSubmission[] = [];

    querySnapshot.forEach((docSnapshot) => {
      submissions.push({
        id: docSnapshot.id,
        ...docSnapshot.data(),
      } as VolunteerSubmission);
    });

    return submissions;
  }

  /**
   * Get all contact us submissions
   */
  async getAllContactUs(): Promise<ContactUsSubmission[]> {
    const collectionRef = collection(this.db, this.CONTACT_US_COLLECTION);
    const q = query(collectionRef, orderBy('submittedAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const submissions: ContactUsSubmission[] = [];

    querySnapshot.forEach((docSnapshot) => {
      submissions.push({
        id: docSnapshot.id,
        ...docSnapshot.data(),
      } as ContactUsSubmission);
    });

    return submissions;
  }

  /**
   * Get a single contact us by ID
   */
  async getContactUsById(id: string): Promise<ContactUsSubmission | null> {
    const docRef = doc(this.db, this.CONTACT_US_COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as ContactUsSubmission;
    }

    return null;
  }

  /**
   * Update notes for a contact us submission
   */
  async updateContactUsNotes(id: string, notes: string): Promise<void> {
    const docRef = doc(this.db, this.CONTACT_US_COLLECTION, id);
    await updateDoc(docRef, { notes });
  }

  /**
   * Get all member submissions
   */
  async getAllMembers(): Promise<MemberSubmission[]> {
    const collectionRef = collection(this.db, this.VOLUNTEERS_COLLECTION);
    const q = query(
      collectionRef,
      where('type', '==', 'church-member')
    );
    const querySnapshot = await getDocs(q);
    const submissions: MemberSubmission[] = [];

    querySnapshot.forEach((docSnapshot) => {
      submissions.push({
        id: docSnapshot.id,
        ...docSnapshot.data(),
      } as MemberSubmission);
    });

    return submissions;
  }

  /**
   * Get a single member by ID
   */
  async getMemberById(id: string): Promise<MemberSubmission | null> {
    const docRef = doc(this.db, this.VOLUNTEERS_COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as MemberSubmission;
    }

    return null;
  }

  /**
   * Get members by status
   */
  async getMembersByStatus(status: string): Promise<MemberSubmission[]> {
    const collectionRef = collection(this.db, this.MEMBERS_COLLECTION);
    const q = query(
      collectionRef,
      where('status', '==', status),
      orderBy('submittedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const submissions: MemberSubmission[] = [];

    querySnapshot.forEach((docSnapshot) => {
      submissions.push({
        id: docSnapshot.id,
        ...docSnapshot.data(),
      } as MemberSubmission);
    });

    return submissions;
  }

  /**
   * Update member status
   */
  async updateMemberStatus(id: string, status: 'approved' | 'rejected'): Promise<void> {
    const docRef = doc(this.db, this.MEMBERS_COLLECTION, id);
    await updateDoc(docRef, {
      status,
      processedAt: new Date(),
    });
  }

  /**
   * Update notes for a member submission
   */
  async updateMemberNotes(id: string, notes: string): Promise<void> {
    const docRef = doc(this.db, this.MEMBERS_COLLECTION, id);
    await updateDoc(docRef, { notes });
  }
}
