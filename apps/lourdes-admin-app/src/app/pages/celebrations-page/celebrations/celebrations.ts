import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  FirestoreService,
  Celebration,
} from '../../../shared/services/firestore.service';
import { addDoc, collection, getFirestore } from 'firebase/firestore';

@Component({
  selector: 'app-celebrations',
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './celebrations.html',
  styleUrls: ['./celebrations.scss'],
})
export class Celebrations implements OnInit {
  private firestoreService = inject(FirestoreService);
  private router = inject(Router);
  private cd = inject(ChangeDetectorRef);
  private fb = inject(FormBuilder);

  public celebrations: Celebration[] = [];
  public filteredCelebrations: Celebration[] = [];
  public loading = true;
  public selectedStatus: string = 'all';
  public searchTerm = '';
  public showBulkModal = false;
  public bulkForm!: FormGroup;
  public savingBulk = false;

  public statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'draft', label: 'Draft' },
    { value: 'published', label: 'Published' },
  ];

  async ngOnInit(): Promise<void> {
    this.initBulkForm();
    await this.loadCelebrations();
  }

  initBulkForm(): void {
    this.bulkForm = this.fb.group({
      celebrations: this.fb.array([this.createCelebrationForm()])
    });
  }

  createCelebrationForm(): FormGroup {
    return this.fb.group({
      date: ['', Validators.required],
      church: ['', Validators.required],
      location: ['', Validators.required],
      time: ['', Validators.required],
      celebrant: ['', Validators.required],
      celebrationType: ['', Validators.required],
      liturgicalCalendar: [''],
      specialNotes: [''],
    });
  }

  get celebrationForms(): FormArray {
    return this.bulkForm.get('celebrations') as FormArray;
  }

  addCelebrationForm(): void {
    this.celebrationForms.push(this.createCelebrationForm());
  }

  removeCelebrationForm(index: number): void {
    if (this.celebrationForms.length > 1) {
      this.celebrationForms.removeAt(index);
    }
  }

  openBulkModal(): void {
    this.showBulkModal = true;
    this.initBulkForm();
  }

  closeBulkModal(): void {
    this.showBulkModal = false;
    this.initBulkForm();
  }

  async saveBulkCelebrations(): Promise<void> {
    if (this.bulkForm.invalid || this.savingBulk) return;

    this.savingBulk = true;
    try {
      const db = getFirestore();
      const celebrationsData = this.celebrationForms.value;

      // Create all celebrations
      const promises = celebrationsData.map((celebrationData: any) => {
        return addDoc(collection(db, 'celebrations'), {
          ...celebrationData,
          date: celebrationData.date ? new Date(celebrationData.date) : null,
          status: 'draft',
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      });

      await Promise.all(promises);

      // Reload celebrations
      await this.loadCelebrations();
      
      // Close modal and reset form
      this.closeBulkModal();
    } catch (error) {
      console.error('Error saving bulk celebrations:', error);
    } finally {
      this.savingBulk = false;
      this.cd.detectChanges();
    }
  }

  async loadCelebrations(): Promise<void> {
    this.loading = true;
    try {
      this.celebrations = await this.firestoreService.getAllCelebrations();
      this.applyFilters();
    } catch (error) {
      console.error('Error loading celebrations:', error);
    } finally {
      this.loading = false;
      this.cd.detectChanges();
    }
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  onSearch(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.celebrations];

    // Filter by status
    if (this.selectedStatus !== 'all') {
      filtered = filtered.filter((c) => c.status === this.selectedStatus);
    }

    // Filter by search term
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter((c) => {
        return (
          c.church.toLowerCase().includes(term) ||
          c.location.toLowerCase().includes(term) ||
          c.celebrant.toLowerCase().includes(term) ||
          c.celebrationType.toLowerCase().includes(term) ||
          (c.liturgicalCalendar && c.liturgicalCalendar.toLowerCase().includes(term))
        );
      });
    }

    this.filteredCelebrations = filtered;
  }

  viewDetails(celebration: Celebration): void {
    this.router.navigate(['/celebrations', celebration.id]);
  }

  createNew(): void {
    this.router.navigate(['/celebrations', 'new']);
  }

  formatDate(date: any): string {
    return this.firestoreService.formatDate(date);
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
