import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  FirestoreService,
  LiveCelebration,
} from '../../../shared/services/firestore.service';
import { addDoc, collection, getFirestore } from 'firebase/firestore';

@Component({
  selector: 'app-live-celebration-detail',
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './live-celebration-detail.html',
  styleUrls: ['./live-celebration-detail.scss'],
})
export class LiveCelebrationDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private firestoreService = inject(FirestoreService);
  private fb = inject(FormBuilder);
  private cd = inject(ChangeDetectorRef);

  public celebration: LiveCelebration | null = null;
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
      title: ['', Validators.required],
      description: ['', Validators.required],
      date: ['', Validators.required],
      time: ['', Validators.required],
      liveStreamUrl: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/)]],
      status: ['draft'],
    });
  }

  async loadCelebration(id: string): Promise<void> {
    this.loading = true;
    try {
      this.celebration = await this.firestoreService.getLiveCelebrationById(id);
      if (this.celebration) {
        this.celebrationForm.patchValue({
          title: this.celebration.title,
          description: this.celebration.description,
          date: this.celebration.date ? this.formatDateForInput(this.celebration.date) : '',
          time: this.celebration.time || '',
          liveStreamUrl: this.celebration.liveStreamUrl,
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
          title: formValue.title,
          description: formValue.description,
          date: formValue.date ? new Date(formValue.date) : null,
          time: formValue.time || '',
          liveStreamUrl: formValue.liveStreamUrl,
          status: formValue.status || 'draft',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        const docRef = await addDoc(collection(db, 'live-celebrations'), celebrationData);
        
        // Update state to reflect that this is no longer a new celebration
        this.isNewCelebration = false;
        this.celebrationId = docRef.id;
        
        // Load the newly created celebration
        await this.loadCelebration(docRef.id);
      } else {
        // Update existing celebration
        await this.firestoreService.updateLiveCelebration(this.celebrationId, {
          title: formValue.title,
          description: formValue.description,
          date: formValue.date ? new Date(formValue.date) : undefined,
          time: formValue.time || '',
          liveStreamUrl: formValue.liveStreamUrl,
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
      await this.firestoreService.updateLiveCelebrationStatus(this.celebrationId, 'published');
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
      await this.firestoreService.updateLiveCelebrationStatus(this.celebrationId, 'draft');
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
      await this.firestoreService.deleteLiveCelebration(this.celebrationId);
      this.router.navigate(['/live-celebrations']);
    } catch (error) {
      console.error('Error deleting celebration:', error);
      this.saving = false;
      this.cd.detectChanges();
    }
  }

  goBack(): void {
    this.router.navigate(['/live-celebrations']);
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
