import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  FirestoreService,
  Celebration,
} from '../../../shared/services/firestore.service';
import { addDoc, collection, getFirestore } from 'firebase/firestore';

@Component({
  selector: 'app-celebration-detail',
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './celebration-detail.html',
  styleUrls: ['./celebration-detail.scss'],
})
export class CelebrationDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private firestoreService = inject(FirestoreService);
  private fb = inject(FormBuilder);
  private cd = inject(ChangeDetectorRef);

  public celebration: Celebration | null = null;
  public celebrationForm!: FormGroup;
  public loading = true;
  public saving = false;
  public isNewCelebration = false;
  public celebrationId = '';

  async ngOnInit(): Promise<void> {
    this.initForm();
    
    const id = this.route.snapshot.paramMap.get('id');
    if (id === 'new') {
      this.isNewCelebration = true;
      this.loading = false;
    } else if (id) {
      this.celebrationId = id;
      await this.loadCelebration(id);
    }
  }

  initForm(): void {
    this.celebrationForm = this.fb.group({
      date: ['', Validators.required],
      church: ['', Validators.required],
      location: ['', Validators.required],
      time: ['', Validators.required],
      celebrant: ['', Validators.required],
      celebrationType: ['', Validators.required],
      liturgicalCalendar: [''],
      specialNotes: [''],
      status: ['draft'],
    });
  }

  async loadCelebration(id: string): Promise<void> {
    this.loading = true;
    try {
      this.celebration = await this.firestoreService.getCelebrationById(id);
      if (this.celebration) {
        this.celebrationForm.patchValue({
          date: this.celebration.date ? this.formatDateForInput(this.celebration.date) : '',
          church: this.celebration.church,
          location: this.celebration.location,
          time: this.celebration.time || '',
          celebrant: this.celebration.celebrant,
          celebrationType: this.celebration.celebrationType,
          liturgicalCalendar: this.celebration.liturgicalCalendar || '',
          specialNotes: this.celebration.specialNotes || '',
          status: this.celebration.status || 'draft',
        });
      }
    } catch (error) {
      console.error('Error loading celebration:', error);
    } finally {
      this.loading = false;
      this.cd.detectChanges();
    }
  }

  async saveCelebration(): Promise<void> {
    if (this.celebrationForm.invalid || this.saving) return;

    this.saving = true;
    try {
      const formValue = this.celebrationForm.value;

      if (this.isNewCelebration) {
        // Create new celebration
        const db = getFirestore();
        const celebrationData = {
          date: formValue.date ? new Date(formValue.date) : null,
          church: formValue.church,
          location: formValue.location,
          time: formValue.time || '',
          celebrant: formValue.celebrant,
          celebrationType: formValue.celebrationType,
          liturgicalCalendar: formValue.liturgicalCalendar || '',
          specialNotes: formValue.specialNotes || '',
          status: formValue.status || 'draft',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        const docRef = await addDoc(collection(db, 'celebrations'), celebrationData);
        
        // Update state to reflect that this is no longer a new celebration
        this.isNewCelebration = false;
        this.celebrationId = docRef.id;
        
        // Load the newly created celebration
        await this.loadCelebration(docRef.id);
      } else {
        // Update existing celebration
        await this.firestoreService.updateCelebration(this.celebrationId, {
          date: formValue.date ? new Date(formValue.date) : undefined,
          church: formValue.church,
          location: formValue.location,
          time: formValue.time || '',
          celebrant: formValue.celebrant,
          celebrationType: formValue.celebrationType,
          liturgicalCalendar: formValue.liturgicalCalendar || '',
          specialNotes: formValue.specialNotes || '',
          status: formValue.status,
        });
        
        await this.loadCelebration(this.celebrationId);
      }
    } catch (error) {
      console.error('Error saving celebration:', error);
    } finally {
      this.saving = false;
      this.cd.detectChanges();
    }
  }

  async publishCelebration(): Promise<void> {
    if (this.saving) return;

    this.saving = true;
    try {
      await this.firestoreService.updateCelebrationStatus(this.celebrationId, 'published');
      if (this.celebration) {
        this.celebration.status = 'published';
        this.celebrationForm.patchValue({ status: 'published' });
      }
    } catch (error) {
      console.error('Error publishing celebration:', error);
    } finally {
      this.saving = false;
      this.cd.detectChanges();
    }
  }

  async unpublishCelebration(): Promise<void> {
    if (this.saving) return;

    this.saving = true;
    try {
      await this.firestoreService.updateCelebrationStatus(this.celebrationId, 'draft');
      if (this.celebration) {
        this.celebration.status = 'draft';
        this.celebrationForm.patchValue({ status: 'draft' });
      }
    } catch (error) {
      console.error('Error unpublishing celebration:', error);
    } finally {
      this.saving = false;
      this.cd.detectChanges();
    }
  }

  async deleteCelebration(): Promise<void> {
    if (this.saving) return;

    const confirmed = confirm('Are you sure you want to delete this celebration? This action cannot be undone.');
    if (!confirmed) return;

    this.saving = true;
    try {
      await this.firestoreService.deleteCelebration(this.celebrationId);
      this.router.navigate(['/celebrations']);
    } catch (error) {
      console.error('Error deleting celebration:', error);
      this.saving = false;
      this.cd.detectChanges();
    }
  }

  goBack(): void {
    this.router.navigate(['/celebrations']);
  }

  formatDate(date: any): string {
    return this.firestoreService.formatDate(date);
  }

  formatDateForInput(date: any): string {
    if (!date) return '';
    const d = date instanceof Date ? date : (date as any).toDate();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getStatusClass(status?: string): string {
    switch (status) {
      case 'published':
        return 'badge-success';
      case 'draft':
        return 'badge-warning';
      default:
        return 'badge-ghost';
    }
  }
}
