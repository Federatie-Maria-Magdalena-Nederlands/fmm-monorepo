import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  getFirestore,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

export interface Magazine {
  id: string;
  title: string;
  date: Date | Timestamp;
  fileUrl: string;
  fileName?: string;
  status?: 'draft' | 'published';
  createdAt: Date | Timestamp;
  updatedAt?: Date | Timestamp;
}

@Component({
  selector: 'app-magazines',
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './magazines.html',
  styleUrls: ['./magazines.scss'],
})
export class Magazines implements OnInit {
  private fb = inject(FormBuilder);
  private db = getFirestore();
  private storage = getStorage();

  public magazines = signal<Magazine[]>([]);
  public filteredMagazines = signal<Magazine[]>([]);
  public loading = signal(true);
  public selectedStatus = signal('all');
  public searchTerm = signal('');
  public showModal = signal(false);
  public magazineForm!: FormGroup;
  public saving = signal(false);
  public editingMagazine = signal<Magazine | null>(null);
  public selectedFile = signal<File | null>(null);
  public uploadProgress = signal(0);

  public statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'draft', label: 'Draft' },
    { value: 'published', label: 'Published' },
  ];

  async ngOnInit(): Promise<void> {
    this.initForm();
    await this.loadMagazines();
  }

  initForm(): void {
    this.magazineForm = this.fb.group({
      title: ['', Validators.required],
      date: ['', Validators.required],
      fileUrl: [''],
      status: ['draft', Validators.required],
    });
  }

  async loadMagazines(): Promise<void> {
    this.loading.set(true);
    try {
      const magazinesRef = collection(this.db, 'magazines');
      const querySnapshot = await getDocs(magazinesRef);
      
      const magazinesList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Magazine[];

      // Sort by date descending
      magazinesList.sort((a, b) => {
        const dateA = a.date instanceof Date ? a.date : (a.date as Timestamp).toDate();
        const dateB = b.date instanceof Date ? b.date : (b.date as Timestamp).toDate();
        return dateB.getTime() - dateA.getTime();
      });

      this.magazines.set(magazinesList);
      this.applyFilters();
    } catch (error) {
      console.error('Error loading magazines:', error);
      alert('Failed to load magazines');
    } finally {
      this.loading.set(false);
    }
  }

  applyFilters(): void {
    const filtered = this.magazines().filter((magazine) => {
      const matchesStatus =
        this.selectedStatus() === 'all' || magazine.status === this.selectedStatus();
      const matchesSearch =
        !this.searchTerm() ||
        magazine.title.toLowerCase().includes(this.searchTerm().toLowerCase());
      return matchesStatus && matchesSearch;
    });
    this.filteredMagazines.set(filtered);
  }

  onStatusChange(): void {
    this.applyFilters();
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  openCreateModal(): void {
    this.editingMagazine.set(null);
    this.selectedFile.set(null);
    this.initForm();
    this.showModal.set(true);
  }

  openEditModal(magazine: Magazine): void {
    this.editingMagazine.set(magazine);
    this.selectedFile.set(null);
    
    const date = magazine.date instanceof Date 
      ? magazine.date 
      : (magazine.date as Timestamp).toDate();
    
    this.magazineForm.patchValue({
      title: magazine.title,
      date: date.toISOString().split('T')[0],
      fileUrl: magazine.fileUrl || '',
      status: magazine.status || 'draft',
    });
    
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingMagazine.set(null);
    this.selectedFile.set(null);
    this.uploadProgress.set(0);
    this.initForm();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile.set(input.files[0]);
    }
  }

  async uploadFile(file: File): Promise<string> {
    const timestamp = Date.now();
    const fileName = `magazines/${timestamp}_${file.name}`;
    const storageRef = ref(this.storage, fileName);
    
    await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(storageRef);
    
    return downloadUrl;
  }

  async saveMagazine(): Promise<void> {
    if (this.magazineForm.invalid || this.saving()) return;

    const formValue = this.magazineForm.value;
    const file = this.selectedFile();
    const urlFromForm = formValue.fileUrl?.trim();

    // For new magazines, either file or URL is required
    if (!this.editingMagazine() && !file && !urlFromForm) {
      alert('Please either upload a file or provide a PDF URL');
      return;
    }

    this.saving.set(true);
    try {
      const editingMag = this.editingMagazine();
      let fileUrl = editingMag?.fileUrl || '';
      let fileName = editingMag?.fileName || '';

      // Priority: 1. Uploaded file, 2. URL from form, 3. Existing URL
      if (file) {
        fileUrl = await this.uploadFile(file);
        fileName = file.name;
      } else if (urlFromForm) {
        fileUrl = urlFromForm;
        fileName = 'External PDF';
      }

      const magazineData = {
        title: formValue.title,
        date: new Date(formValue.date),
        fileUrl,
        fileName,
        status: formValue.status,
        updatedAt: new Date(),
      };

      if (editingMag) {
        // Update existing magazine
        const magazineRef = doc(this.db, 'magazines', editingMag.id);
        await updateDoc(magazineRef, magazineData);
        alert('Magazine updated successfully!');
      } else {
        // Create new magazine
        await addDoc(collection(this.db, 'magazines'), {
          ...magazineData,
          createdAt: new Date(),
        });
        alert('Magazine created successfully!');
      }

      this.closeModal();
      await this.loadMagazines();
    } catch (error) {
      console.error('Error saving magazine:', error);
      alert('Failed to save magazine');
    } finally {
      this.saving.set(false);
    }
  }

  async deleteMagazine(magazine: Magazine): Promise<void> {
    if (!confirm(`Are you sure you want to delete "${magazine.title}"?`)) {
      return;
    }

    try {
      // Delete file from storage
      if (magazine.fileUrl) {
        try {
          const fileRef = ref(this.storage, magazine.fileUrl);
          await deleteObject(fileRef);
        } catch (error) {
          console.warn('Error deleting file from storage:', error);
        }
      }

      // Delete magazine document
      const magazineRef = doc(this.db, 'magazines', magazine.id);
      await deleteDoc(magazineRef);
      
      alert('Magazine deleted successfully!');
      await this.loadMagazines();
    } catch (error) {
      console.error('Error deleting magazine:', error);
      alert('Failed to delete magazine');
    }
  }

  async toggleStatus(magazine: Magazine): Promise<void> {
    try {
      const newStatus = magazine.status === 'published' ? 'draft' : 'published';
      const magazineRef = doc(this.db, 'magazines', magazine.id);
      
      await updateDoc(magazineRef, {
        status: newStatus,
        updatedAt: new Date(),
      });

      // Update the local state
      this.magazines.update(mags => 
        mags.map(m => m.id === magazine.id ? { ...m, status: newStatus } : m)
      );
      this.applyFilters();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  }

  formatDate(date: Date | Timestamp): string {
    const d = date instanceof Date ? date : (date as Timestamp).toDate();
    return d.toLocaleDateString('nl-NL', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  viewPDF(fileUrl: string): void {
    window.open(fileUrl, '_blank');
  }
}
