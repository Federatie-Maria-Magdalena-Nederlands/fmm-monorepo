import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  Timestamp,
  getFirestore,
} from 'firebase/firestore';
import { getStorage, ref, deleteObject } from 'firebase/storage';
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

export interface Activity {
  id: string;
  title: string;
  description: string;
  image?: string;
  body: string;
  date?: Date | Timestamp;
  time?: string;
  status?: 'draft' | 'published';
  createdAt: Date | Timestamp;
  updatedAt?: Date | Timestamp;
}

export interface LiveCelebration {
  id: string;
  title: string;
  description: string;
  date?: Date | Timestamp;
  time?: string;
  liveStreamUrl: string;
  status?: 'draft' | 'published';
  createdAt: Date | Timestamp;
  updatedAt?: Date | Timestamp;
}

export interface Blog {
  id: string;
  title: string;
  description: string;
  image?: string;
  body: string;
  date?: Date | Timestamp;
  time?: string;
  status?: 'draft' | 'published';
  createdAt: Date | Timestamp;
  updatedAt?: Date | Timestamp;
}

export interface Celebration {
  id: string;
  date?: Date | Timestamp;
  church: string;
  location: string;
  time?: string;
  celebrant: string;
  celebrationType: string;
  liturgicalCalendar?: string;
  specialNotes?: string;
  status?: 'draft' | 'published';
  createdAt: Date | Timestamp;
  updatedAt?: Date | Timestamp;
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
  private readonly ACTIVITIES_COLLECTION = 'activities';
  private readonly LIVE_CELEBRATIONS_COLLECTION = 'live-celebrations';
  private readonly BLOGS_COLLECTION = 'blogs';
  private readonly CELEBRATIONS_COLLECTION = 'celebrations';

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
   * Update sacrament submission status
   */
  async updateSacramentStatus(id: string, status: 'approved' | 'rejected'): Promise<void> {
    const docRef = doc(this.db, this.COLLECTION_NAME, id);
    await updateDoc(docRef, {
      status,
      processedAt: new Date(),
    });
  }

  /**
   * Update notes for a sacrament submission
   */
  async updateSacramentNotes(id: string, notes: string): Promise<void> {
    const docRef = doc(this.db, this.COLLECTION_NAME, id);
    await updateDoc(docRef, { notes });
  }

  /**
   * Delete a sacrament submission and all associated files from storage
   */
  async deleteSacrament(id: string): Promise<void> {
    // Get the sacrament first to retrieve file URLs
    const sacrament = await this.findSubmissionById(id);
    
    // Delete all files from storage if they exist
    if (sacrament?.formData) {
      const storage = getStorage();
      const formData = sacrament.formData;
      
      // Find all URL fields in formData (they typically end with 'Url')
      for (const [key, value] of Object.entries(formData)) {
        if (key.toLowerCase().includes('url') && typeof value === 'string' && value.includes('firebase')) {
          try {
            const pathStart = value.indexOf('/o/') + 3;
            const pathEnd = value.indexOf('?');
            if (pathStart > 2 && pathEnd > pathStart) {
              const encodedPath = value.substring(pathStart, pathEnd);
              const filePath = decodeURIComponent(encodedPath);
              const fileRef = ref(storage, filePath);
              await deleteObject(fileRef);
            }
          } catch (error) {
            console.error(`Error deleting file from storage (${key}):`, error);
            // Continue with other files even if one fails
          }
        }
      }
    }
    
    // Delete the Firestore document
    const docRef = doc(this.db, this.COLLECTION_NAME, id);
    await deleteDoc(docRef);
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
   * Update mass intention status
   */
  async updateMassIntentionStatus(id: string, status: 'approved' | 'rejected' | 'completed'): Promise<void> {
    const docRef = doc(this.db, this.MASS_INTENTIONS_COLLECTION, id);
    await updateDoc(docRef, {
      status,
      processedAt: new Date(),
    });
  }

  /**
   * Update notes for a mass intention submission
   */
  async updateMassIntentionNotes(id: string, notes: string): Promise<void> {
    const docRef = doc(this.db, this.MASS_INTENTIONS_COLLECTION, id);
    await updateDoc(docRef, { notes });
  }

  /**
   * Delete a mass intention submission and all associated files from storage
   */
  async deleteMassIntention(id: string): Promise<void> {
    // Get the mass intention first to retrieve file URLs
    const massIntention = await this.getMassIntentionById(id);
    
    // Delete all files from storage if they exist
    if (massIntention?.formData) {
      const storage = getStorage();
      const formData = massIntention.formData;
      
      // Find all URL fields in formData (they typically end with 'Url' or contain 'url')
      for (const [key, value] of Object.entries(formData)) {
        if (key.toLowerCase().includes('url') && typeof value === 'string' && value.includes('firebase')) {
          try {
            const pathStart = value.indexOf('/o/') + 3;
            const pathEnd = value.indexOf('?');
            if (pathStart > 2 && pathEnd > pathStart) {
              const encodedPath = value.substring(pathStart, pathEnd);
              const filePath = decodeURIComponent(encodedPath);
              const fileRef = ref(storage, filePath);
              await deleteObject(fileRef);
            }
          } catch (error) {
            console.error(`Error deleting file from storage (${key}):`, error);
            // Continue with other files even if one fails
          }
        }
      }
    }
    
    // Delete the Firestore document
    const docRef = doc(this.db, this.MASS_INTENTIONS_COLLECTION, id);
    await deleteDoc(docRef);
  }

  // === DONATIONS METHODS ===
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
   * Update donation status
   */
  async updateDonationStatus(id: string, status: 'approved' | 'rejected'): Promise<void> {
    const docRef = doc(this.db, this.DONATIONS_COLLECTION, id);
    await updateDoc(docRef, {
      status,
      processedAt: new Date(),
    });
  }

  /**
   * Update notes for a donation submission
   */
  async updateDonationNotes(id: string, notes: string): Promise<void> {
    const docRef = doc(this.db, this.DONATIONS_COLLECTION, id);
    await updateDoc(docRef, { notes });
  }

  /**
   * Delete a donation submission and all associated files from storage
   */
  async deleteDonation(id: string): Promise<void> {
    // Get the donation first to retrieve file URLs
    const donation = await this.getDonationById(id);
    
    // Delete all files from storage if they exist
    if (donation?.formData) {
      const storage = getStorage();
      const formData = donation.formData;
      
      // Find all URL fields in formData (they typically end with 'Url' or contain 'url')
      for (const [key, value] of Object.entries(formData)) {
        if (key.toLowerCase().includes('url') && typeof value === 'string' && value.includes('firebase')) {
          try {
            const pathStart = value.indexOf('/o/') + 3;
            const pathEnd = value.indexOf('?');
            if (pathStart > 2 && pathEnd > pathStart) {
              const encodedPath = value.substring(pathStart, pathEnd);
              const filePath = decodeURIComponent(encodedPath);
              const fileRef = ref(storage, filePath);
              await deleteObject(fileRef);
            }
          } catch (error) {
            console.error(`Error deleting file from storage (${key}):`, error);
            // Continue with other files even if one fails
          }
        }
      }
    }
    
    // Delete the Firestore document
    const docRef = doc(this.db, this.DONATIONS_COLLECTION, id);
    await deleteDoc(docRef);
  }

  // === VOLUNTEERS METHODS ===
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
   * Update volunteer status
   */
  async updateVolunteerStatus(id: string, status: 'approved' | 'rejected'): Promise<void> {
    const docRef = doc(this.db, this.VOLUNTEERS_COLLECTION, id);
    await updateDoc(docRef, {
      status,
      processedAt: new Date(),
    });
  }

  /**
   * Update notes for a volunteer submission
   */
  async updateVolunteerNotes(id: string, notes: string): Promise<void> {
    const docRef = doc(this.db, this.VOLUNTEERS_COLLECTION, id);
    await updateDoc(docRef, { notes });
  }

  /**
   * Delete a volunteer submission and all associated files from storage
   */
  async deleteVolunteer(id: string): Promise<void> {
    // Get the volunteer first to retrieve file URLs
    const volunteer = await this.getVolunteerById(id);
    
    // Delete all files from storage if they exist
    if (volunteer?.formData) {
      const storage = getStorage();
      const formData = volunteer.formData;
      
      // Find all URL fields in formData (they typically end with 'Url' or contain 'url')
      for (const [key, value] of Object.entries(formData)) {
        if (key.toLowerCase().includes('url') && typeof value === 'string' && value.includes('firebase')) {
          try {
            const pathStart = value.indexOf('/o/') + 3;
            const pathEnd = value.indexOf('?');
            if (pathStart > 2 && pathEnd > pathStart) {
              const encodedPath = value.substring(pathStart, pathEnd);
              const filePath = decodeURIComponent(encodedPath);
              const fileRef = ref(storage, filePath);
              await deleteObject(fileRef);
            }
          } catch (error) {
            console.error(`Error deleting file from storage (${key}):`, error);
            // Continue with other files even if one fails
          }
        }
      }
    }
    
    // Delete the Firestore document
    const docRef = doc(this.db, this.VOLUNTEERS_COLLECTION, id);
    await deleteDoc(docRef);
  }

  // === CONTACT US METHODS ===
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
    const collectionRef = collection(this.db, this.VOLUNTEERS_COLLECTION);
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
    const docRef = doc(this.db, this.VOLUNTEERS_COLLECTION, id);
    await updateDoc(docRef, {
      status,
      processedAt: new Date(),
    });
  }

  /**
   * Update notes for a member submission
   */
  async updateMemberNotes(id: string, notes: string): Promise<void> {
    const docRef = doc(this.db, this.VOLUNTEERS_COLLECTION, id);
    await updateDoc(docRef, { notes });
  }

  /**
   * Delete a member submission and all associated files from storage
   */
  async deleteMember(id: string): Promise<void> {
    // Get the member first to retrieve file URLs
    const member = await this.getMemberById(id);
    
    // Delete all files from storage if they exist
    if (member?.formData) {
      const storage = getStorage();
      const formData = member.formData;
      
      // Find all URL fields in formData (they typically end with 'Url' or contain 'url')
      for (const [key, value] of Object.entries(formData)) {
        if (key.toLowerCase().includes('url') && typeof value === 'string' && value.includes('firebase')) {
          try {
            const pathStart = value.indexOf('/o/') + 3;
            const pathEnd = value.indexOf('?');
            if (pathStart > 2 && pathEnd > pathStart) {
              const encodedPath = value.substring(pathStart, pathEnd);
              const filePath = decodeURIComponent(encodedPath);
              const fileRef = ref(storage, filePath);
              await deleteObject(fileRef);
            }
          } catch (error) {
            console.error(`Error deleting file from storage (${key}):`, error);
            // Continue with other files even if one fails
          }
        }
      }
    }
    
    // Delete the Firestore document
    const docRef = doc(this.db, this.VOLUNTEERS_COLLECTION, id);
    await deleteDoc(docRef);
  }

  // === ACTIVITIES METHODS ===
  
  /**
   * Get all activities
   */
  async getAllActivities(): Promise<Activity[]> {
    const collectionRef = collection(this.db, this.ACTIVITIES_COLLECTION);
    const q = query(collectionRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const activities: Activity[] = [];

    querySnapshot.forEach((docSnapshot) => {
      activities.push({
        id: docSnapshot.id,
        ...docSnapshot.data(),
      } as Activity);
    });

    return activities;
  }

  /**
   * Get a single activity by ID
   */
  async getActivityById(id: string): Promise<Activity | null> {
    const docRef = doc(this.db, this.ACTIVITIES_COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as Activity;
    }

    return null;
  }

  /**
   * Get activities by status
   */
  async getActivitiesByStatus(status: string): Promise<Activity[]> {
    const collectionRef = collection(this.db, this.ACTIVITIES_COLLECTION);
    const q = query(
      collectionRef,
      where('status', '==', status),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const activities: Activity[] = [];

    querySnapshot.forEach((docSnapshot) => {
      activities.push({
        id: docSnapshot.id,
        ...docSnapshot.data(),
      } as Activity);
    });

    return activities;
  }

  /**
   * Update activity status
   */
  async updateActivityStatus(id: string, status: 'draft' | 'published'): Promise<void> {
    const docRef = doc(this.db, this.ACTIVITIES_COLLECTION, id);
    await updateDoc(docRef, {
      status,
      updatedAt: new Date(),
    });
  }

  /**
   * Update an activity
   */
  async updateActivity(id: string, data: Partial<Activity>): Promise<void> {
    const docRef = doc(this.db, this.ACTIVITIES_COLLECTION, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date(),
    });
  }

  /**
   * Delete an activity
   */
  async deleteActivity(id: string): Promise<void> {
    // Get the activity first to retrieve the image URL
    const activity = await this.getActivityById(id);
    
    // Delete image from storage if it exists
    if (activity?.image) {
      try {
        const storage = getStorage();
        // Extract the path from the Firebase Storage URL
        // URL format: https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{path}?alt=media&token={token}
        const imageUrl = activity.image;
        if (imageUrl.includes('firebase')) {
          const pathStart = imageUrl.indexOf('/o/') + 3;
          const pathEnd = imageUrl.indexOf('?');
          if (pathStart > 2 && pathEnd > pathStart) {
            const encodedPath = imageUrl.substring(pathStart, pathEnd);
            const imagePath = decodeURIComponent(encodedPath);
            const imageRef = ref(storage, imagePath);
            await deleteObject(imageRef);
          }
        }
      } catch (error) {
        console.error('Error deleting image from storage:', error);
        // Continue with document deletion even if image deletion fails
      }
    }
    
    // Delete the Firestore document
    const docRef = doc(this.db, this.ACTIVITIES_COLLECTION, id);
    await deleteDoc(docRef);
  }

  // === LIVE CELEBRATIONS METHODS ===
  
  /**
   * Get all live celebrations
   */
  async getAllLiveCelebrations(): Promise<LiveCelebration[]> {
    const collectionRef = collection(this.db, this.LIVE_CELEBRATIONS_COLLECTION);
    const q = query(collectionRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const celebrations: LiveCelebration[] = [];

    querySnapshot.forEach((docSnapshot) => {
      celebrations.push({
        id: docSnapshot.id,
        ...docSnapshot.data(),
      } as LiveCelebration);
    });

    return celebrations;
  }

  /**
   * Get a single live celebration by ID
   */
  async getLiveCelebrationById(id: string): Promise<LiveCelebration | null> {
    const docRef = doc(this.db, this.LIVE_CELEBRATIONS_COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as LiveCelebration;
    }

    return null;
  }

  /**
   * Get live celebrations by status
   */
  async getLiveCelebrationsByStatus(status: string): Promise<LiveCelebration[]> {
    const collectionRef = collection(this.db, this.LIVE_CELEBRATIONS_COLLECTION);
    const q = query(
      collectionRef,
      where('status', '==', status),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const celebrations: LiveCelebration[] = [];

    querySnapshot.forEach((docSnapshot) => {
      celebrations.push({
        id: docSnapshot.id,
        ...docSnapshot.data(),
      } as LiveCelebration);
    });

    return celebrations;
  }

  /**
   * Update live celebration status
   */
  async updateLiveCelebrationStatus(id: string, status: 'draft' | 'published'): Promise<void> {
    const docRef = doc(this.db, this.LIVE_CELEBRATIONS_COLLECTION, id);
    await updateDoc(docRef, {
      status,
      updatedAt: new Date(),
    });
  }

  /**
   * Update a live celebration
   */
  async updateLiveCelebration(id: string, data: Partial<LiveCelebration>): Promise<void> {
    const docRef = doc(this.db, this.LIVE_CELEBRATIONS_COLLECTION, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date(),
    });
  }

  /**
   * Delete a live celebration
   */
  async deleteLiveCelebration(id: string): Promise<void> {
    const docRef = doc(this.db, this.LIVE_CELEBRATIONS_COLLECTION, id);
    await deleteDoc(docRef);
  }

  // ==================== Blog Methods ====================

  /**
   * Get all blogs
   */
  async getAllBlogs(): Promise<Blog[]> {
    const collectionRef = collection(this.db, this.BLOGS_COLLECTION);
    const q = query(collectionRef, orderBy('createdAt', 'desc'));
    
    const querySnapshot = await getDocs(q);
    const blogs: Blog[] = [];

    querySnapshot.forEach((docSnapshot) => {
      blogs.push({
        id: docSnapshot.id,
        ...docSnapshot.data(),
      } as Blog);
    });

    return blogs;
  }

  /**
   * Get blog by ID
   */
  async getBlogById(id: string): Promise<Blog | null> {
    const docRef = doc(this.db, this.BLOGS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as Blog;
    }
    
    return null;
  }

  /**
   * Get blogs by status
   */
  async getBlogsByStatus(status: 'draft' | 'published'): Promise<Blog[]> {
    const collectionRef = collection(this.db, this.BLOGS_COLLECTION);
    const q = query(
      collectionRef,
      where('status', '==', status),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const blogs: Blog[] = [];

    querySnapshot.forEach((docSnapshot) => {
      blogs.push({
        id: docSnapshot.id,
        ...docSnapshot.data(),
      } as Blog);
    });

    return blogs;
  }

  /**
   * Update blog status
   */
  async updateBlogStatus(id: string, status: 'draft' | 'published'): Promise<void> {
    const docRef = doc(this.db, this.BLOGS_COLLECTION, id);
    await updateDoc(docRef, {
      status,
      updatedAt: new Date(),
    });
  }

  /**
   * Update a blog
   */
  async updateBlog(id: string, data: Partial<Blog>): Promise<void> {
    const docRef = doc(this.db, this.BLOGS_COLLECTION, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date(),
    });
  }

  /**
   * Delete a blog (including its image from storage)
   */
  async deleteBlog(id: string): Promise<void> {
    // First get the blog to check if it has an image
    const blog = await this.getBlogById(id);
    
    // Delete the image from storage if it exists
    if (blog?.image) {
      try {
        const storage = getStorage();
        // Extract the path from the URL
        const imageUrl = blog.image;
        const baseUrl = 'https://firebasestorage.googleapis.com/v0/b/';
        if (imageUrl.startsWith(baseUrl)) {
          const pathStart = imageUrl.indexOf('/o/') + 3;
          const pathEnd = imageUrl.indexOf('?');
          const imagePath = decodeURIComponent(imageUrl.substring(pathStart, pathEnd));
          
          const imageRef = ref(storage, imagePath);
          await deleteObject(imageRef);
        }
      } catch (error) {
        console.error('Error deleting blog image:', error);
      }
    }
    
    // Delete the blog document
    const docRef = doc(this.db, this.BLOGS_COLLECTION, id);
    await deleteDoc(docRef);
  }

  // ==================== Celebration Methods ====================

  /**
   * Get all celebrations
   */
  async getAllCelebrations(): Promise<Celebration[]> {
    const collectionRef = collection(this.db, this.CELEBRATIONS_COLLECTION);
    const q = query(collectionRef, orderBy('date', 'desc'));
    
    const querySnapshot = await getDocs(q);
    const celebrations: Celebration[] = [];

    querySnapshot.forEach((docSnapshot) => {
      celebrations.push({
        id: docSnapshot.id,
        ...docSnapshot.data(),
      } as Celebration);
    });

    return celebrations;
  }

  /**
   * Get celebration by ID
   */
  async getCelebrationById(id: string): Promise<Celebration | null> {
    const docRef = doc(this.db, this.CELEBRATIONS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as Celebration;
    }
    
    return null;
  }

  /**
   * Get celebrations by status
   */
  async getCelebrationsByStatus(status: 'draft' | 'published'): Promise<Celebration[]> {
    const collectionRef = collection(this.db, this.CELEBRATIONS_COLLECTION);
    const q = query(
      collectionRef,
      where('status', '==', status),
      orderBy('date', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const celebrations: Celebration[] = [];

    querySnapshot.forEach((docSnapshot) => {
      celebrations.push({
        id: docSnapshot.id,
        ...docSnapshot.data(),
      } as Celebration);
    });

    return celebrations;
  }

  /**
   * Update celebration status
   */
  async updateCelebrationStatus(id: string, status: 'draft' | 'published'): Promise<void> {
    const docRef = doc(this.db, this.CELEBRATIONS_COLLECTION, id);
    await updateDoc(docRef, {
      status,
      updatedAt: new Date(),
    });
  }

  /**
   * Update a celebration
   */
  async updateCelebration(id: string, data: Partial<Celebration>): Promise<void> {
    const docRef = doc(this.db, this.CELEBRATIONS_COLLECTION, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date(),
    });
  }

  /**
   * Delete a celebration
   */
  async deleteCelebration(id: string): Promise<void> {
    const docRef = doc(this.db, this.CELEBRATIONS_COLLECTION, id);
    await deleteDoc(docRef);
  }
}
