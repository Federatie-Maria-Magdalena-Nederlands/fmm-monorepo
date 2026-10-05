import { ChangeDetectorRef, Component, inject, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  FirestoreService,
  Activity,
} from '../../../shared/services/firestore.service';
import { addDoc, collection, getFirestore } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

@Component({
  selector: 'app-activity-detail',
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './activity-detail.html',
  styleUrls: ['./activity-detail.scss'],
})
export class ActivityDetail implements OnInit, AfterViewInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private firestoreService = inject(FirestoreService);
  private fb = inject(FormBuilder);
  private cd = inject(ChangeDetectorRef);

  @ViewChild('bodyEditor') bodyEditor!: ElementRef<HTMLDivElement>;

  public activity: Activity | null = null;
  public activityForm!: FormGroup;
  public loading = true;
  public saving = false;
  public isNewActivity = false;
  public activityId = '';
  public existingImages: string[] = [];
  public newImageFiles: { file: File; preview: string }[] = [];
  public uploading = false;

  async ngOnInit(): Promise<void> {
    this.initForm();
    
    const id = this.route.snapshot.paramMap.get('id');
    if (id === 'new') {
      this.isNewActivity = true;
      this.loading = false;
    } else if (id) {
      this.activityId = id;
      await this.loadActivity(id);
    }
  }

  ngAfterViewInit(): void {
    // Set initial body content after view is initialized
    if (this.bodyEditor && this.activityForm.get('body')?.value) {
      this.bodyEditor.nativeElement.innerHTML = this.activityForm.get('body')?.value;
    }
  }

  initForm(): void {
    this.activityForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      body: ['', Validators.required],
      date: ['', Validators.required],
      time: ['', Validators.required],
      status: ['draft'],
    });
  }

  async loadActivity(id: string): Promise<void> {
    this.loading = true;
    try {
      this.activity = await this.firestoreService.getActivityById(id);
      if (this.activity) {
        this.activityForm.patchValue({
          title: this.activity.title,
          description: this.activity.description,
          body: this.activity.body,
          date: this.activity.date ? this.formatDateForInput(this.activity.date) : '',
          time: this.activity.time || '',
          status: this.activity.status || 'draft',
        });
        
        // Set existing images
        this.existingImages = this.activity.images?.length
          ? [...this.activity.images]
          : this.activity.image
            ? [this.activity.image]
            : [];
        
        // Set editor content if available
        if (this.bodyEditor && this.activity.body) {
          this.bodyEditor.nativeElement.innerHTML = this.activity.body;
        }
      }
    } catch (error) {
      console.error('Error loading activity:', error);
    } finally {
      this.loading = false;
      this.cd.detectChanges();
    }
  }

  async saveActivity(): Promise<void> {
    if (this.activityForm.invalid || this.saving) return;

    this.saving = true;
    try {
      const formValue = this.activityForm.value;

      // Upload any newly selected images
      const uploadedUrls = await this.uploadImages();
      const images = [...this.existingImages, ...uploadedUrls];

      if (this.isNewActivity) {
        // Create new activity
        const db = getFirestore();
        const activityData = {
          title: formValue.title,
          description: formValue.description,
          images,
          body: formValue.body,
          date: formValue.date ? new Date(formValue.date) : null,
          time: formValue.time || '',
          status: formValue.status || 'draft',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        const docRef = await addDoc(collection(db, 'activities'), activityData);
        
        // Update state to reflect that this is no longer a new activity
        this.isNewActivity = false;
        this.activityId = docRef.id;
        
        // Load the newly created activity
        await this.loadActivity(docRef.id);
      } else {
        // Update existing activity
        await this.firestoreService.updateActivity(this.activityId, {
          title: formValue.title,
          description: formValue.description,
          images,
          body: formValue.body,
          date: formValue.date ? new Date(formValue.date) : undefined,
          time: formValue.time || '',
          status: formValue.status,
        });
        
        await this.loadActivity(this.activityId);
      }

      this.newImageFiles = [];
    } catch (error) {
      console.error('Error saving activity:', error);
    } finally {
      this.saving = false;
      this.cd.detectChanges();
    }
  }

  async publishActivity(): Promise<void> {
    if (this.saving) return;

    this.saving = true;
    try {
      await this.firestoreService.updateActivityStatus(this.activityId, 'published');
      if (this.activity) {
        this.activity.status = 'published';
        this.activityForm.patchValue({ status: 'published' });
      }
    } catch (error) {
      console.error('Error publishing activity:', error);
    } finally {
      this.saving = false;
      this.cd.detectChanges();
    }
  }

  async unpublishActivity(): Promise<void> {
    if (this.saving) return;

    this.saving = true;
    try {
      await this.firestoreService.updateActivityStatus(this.activityId, 'draft');
      if (this.activity) {
        this.activity.status = 'draft';
        this.activityForm.patchValue({ status: 'draft' });
      }
    } catch (error) {
      console.error('Error unpublishing activity:', error);
    } finally {
      this.saving = false;
      this.cd.detectChanges();
    }
  }

  async deleteActivity(): Promise<void> {
    if (this.saving) return;

    const confirmed = confirm('Are you sure you want to delete this activity? This action cannot be undone.');
    if (!confirmed) return;

    this.saving = true;
    try {
      await this.firestoreService.deleteActivity(this.activityId);
      this.router.navigate(['/activities']);
    } catch (error) {
      console.error('Error deleting activity:', error);
      this.saving = false;
      this.cd.detectChanges();
    }
  }

  goBack(): void {
    this.router.navigate(['/activities']);
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

  // WYSIWYG Editor Methods
  execCommand(command: string, value: string | null = null): void {
    document.execCommand(command, false, value || undefined);
  }

  insertLink(): void {
    const url = prompt('Enter URL:');
    if (url) {
      this.execCommand('createLink', url);
    }
  }

  onBodyInput(event: Event): void {
    const target = event.target as HTMLElement;
    this.activityForm.patchValue({ body: target.innerHTML });
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    Array.from(input.files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.newImageFiles.push({ file, preview: e.target.result });
        this.cd.detectChanges();
      };
      reader.readAsDataURL(file);
    });

    // Reset input so the same file can be reselected later if removed
    input.value = '';
  }

  removeExistingImage(imageUrl: string): void {
    this.existingImages = this.existingImages.filter((url) => url !== imageUrl);
  }

  removeNewImage(index: number): void {
    this.newImageFiles.splice(index, 1);
  }

  async uploadImages(): Promise<string[]> {
    if (this.newImageFiles.length === 0) return [];

    this.uploading = true;
    try {
      const storage = getStorage();
      const uploadPromises = this.newImageFiles.map(async ({ file }) => {
        const timestamp = Date.now();
        const fileName = `activities/${timestamp}_${file.name}`;
        const storageRef = ref(storage, fileName);

        await uploadBytes(storageRef, file);
        return await getDownloadURL(storageRef);
      });

      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error('Error uploading images:', error);
      return [];
    } finally {
      this.uploading = false;
    }
  }
}