import { ChangeDetectorRef, Component, inject, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  FirestoreService,
  Blog,
} from '../../../shared/services/firestore.service';
import { addDoc, collection, getFirestore } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

@Component({
  selector: 'app-blog-detail',
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './blog-detail.html',
  styleUrls: ['./blog-detail.scss'],
})
export class BlogDetail implements OnInit, AfterViewInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private firestoreService = inject(FirestoreService);
  private fb = inject(FormBuilder);
  private cd = inject(ChangeDetectorRef);

  @ViewChild('bodyEditor') bodyEditor!: ElementRef<HTMLDivElement>;

  public blog: Blog | null = null;
  public blogForm!: FormGroup;
  public loading = true;
  public saving = false;
  public isNewBlog = false;
  public blogId = '';
  public selectedFile: File | null = null;
  public imagePreview: string | null = null;
  public uploading = false;

  async ngOnInit(): Promise<void> {
    this.initForm();
    
    const id = this.route.snapshot.paramMap.get('id');
    if (id === 'new') {
      this.isNewBlog = true;
      this.loading = false;
    } else if (id) {
      this.blogId = id;
      await this.loadBlog(id);
    }
  }

  ngAfterViewInit(): void {
    // Set initial body content after view is initialized
    if (this.bodyEditor && this.blogForm.get('body')?.value) {
      this.bodyEditor.nativeElement.innerHTML = this.blogForm.get('body')?.value;
    }
  }

  initForm(): void {
    this.blogForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      image: [''],
      body: ['', Validators.required],
      date: ['', Validators.required],
      time: ['', Validators.required],
      status: ['draft'],
    });
  }

  async loadBlog(id: string): Promise<void> {
    this.loading = true;
    try {
      this.blog = await this.firestoreService.getBlogById(id);
      if (this.blog) {
        this.blogForm.patchValue({
          title: this.blog.title,
          description: this.blog.description,
          image: this.blog.image || '',
          body: this.blog.body,
          date: this.blog.date ? this.formatDateForInput(this.blog.date) : '',
          time: this.blog.time || '',
          status: this.blog.status || 'draft',
        });
        
        // Set image preview if image exists
        if (this.blog.image) {
          this.imagePreview = this.blog.image;
        }
        
        // Set editor content if available
        if (this.bodyEditor && this.blog.body) {
          this.bodyEditor.nativeElement.innerHTML = this.blog.body;
        }
      }
    } catch (error) {
      console.error('Error loading blog:', error);
    } finally {
      this.loading = false;
      this.cd.detectChanges();
    }
  }

  async saveBlog(): Promise<void> {
    if (this.blogForm.invalid || this.saving) return;

    this.saving = true;
    try {
      const formValue = this.blogForm.value;
      
      // Upload image if a new file was selected
      let imageUrl = formValue.image;
      if (this.selectedFile) {
        const uploadedUrl = await this.uploadImage();
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        }
      }

      if (this.isNewBlog) {
        // Create new blog
        const db = getFirestore();
        const blogData = {
          title: formValue.title,
          description: formValue.description,
          image: imageUrl || '',
          body: formValue.body,
          date: formValue.date ? new Date(formValue.date) : null,
          time: formValue.time || '',
          status: formValue.status || 'draft',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        const docRef = await addDoc(collection(db, 'blogs'), blogData);
        
        // Update state to reflect that this is no longer a new blog
        this.isNewBlog = false;
        this.blogId = docRef.id;
        
        // Load the newly created blog
        await this.loadBlog(docRef.id);
      } else {
        // Update existing blog
        await this.firestoreService.updateBlog(this.blogId, {
          title: formValue.title,
          description: formValue.description,
          image: imageUrl || '',
          body: formValue.body,
          date: formValue.date ? new Date(formValue.date) : undefined,
          time: formValue.time || '',
          status: formValue.status,
        });
        
        await this.loadBlog(this.blogId);
      }
    } catch (error) {
      console.error('Error saving blog:', error);
    } finally {
      this.saving = false;
      this.cd.detectChanges();
    }
  }

  async publishBlog(): Promise<void> {
    if (this.saving) return;

    this.saving = true;
    try {
      await this.firestoreService.updateBlogStatus(this.blogId, 'published');
      if (this.blog) {
        this.blog.status = 'published';
        this.blogForm.patchValue({ status: 'published' });
      }
    } catch (error) {
      console.error('Error publishing blog:', error);
    } finally {
      this.saving = false;
      this.cd.detectChanges();
    }
  }

  async unpublishBlog(): Promise<void> {
    if (this.saving) return;

    this.saving = true;
    try {
      await this.firestoreService.updateBlogStatus(this.blogId, 'draft');
      if (this.blog) {
        this.blog.status = 'draft';
        this.blogForm.patchValue({ status: 'draft' });
      }
    } catch (error) {
      console.error('Error unpublishing blog:', error);
    } finally {
      this.saving = false;
      this.cd.detectChanges();
    }
  }

  async deleteBlog(): Promise<void> {
    if (this.saving) return;

    const confirmed = confirm('Are you sure you want to delete this blog? This action cannot be undone.');
    if (!confirmed) return;

    this.saving = true;
    try {
      await this.firestoreService.deleteBlog(this.blogId);
      this.router.navigate(['/blogs']);
    } catch (error) {
      console.error('Error deleting blog:', error);
      this.saving = false;
      this.cd.detectChanges();
    }
  }

  goBack(): void {
    this.router.navigate(['/blogs']);
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
    this.blogForm.patchValue({ body: target.innerHTML });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      
      // Create image preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
        this.cd.detectChanges();
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  async uploadImage(): Promise<string | null> {
    if (!this.selectedFile) return null;

    this.uploading = true;
    try {
      const storage = getStorage();
      const timestamp = Date.now();
      const fileName = `blogs/${timestamp}_${this.selectedFile.name}`;
      const storageRef = ref(storage, fileName);
      
      await uploadBytes(storageRef, this.selectedFile);
      const downloadURL = await getDownloadURL(storageRef);
      
      return downloadURL;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    } finally {
      this.uploading = false;
    }
  }
}
