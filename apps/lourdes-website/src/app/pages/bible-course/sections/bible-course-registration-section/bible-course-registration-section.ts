import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AbstractBackground } from '../../../../shared/components/abstract-background/abstract-background';
import { FirebaseService } from '../../../../shared/services/firebase.service';

const COMPONENTS = [AbstractBackground];

@Component({
  selector: 'app-bible-course-registration-section',
  imports: [...COMPONENTS, ReactiveFormsModule],
  templateUrl: './bible-course-registration-section.html',
})
export class BibleCourseRegistrationSection {
  private readonly collectionName = 'bible-course';
  public registrationForm: FormGroup;
  public isSubmitting = false;
  public submitSuccess = false;
  public submitError = false;

  constructor(
    private formBuilder: FormBuilder,
    private firebaseService: FirebaseService,
  ) {
    this.registrationForm = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: [
        '',
        [Validators.required, Validators.pattern(/^[\d\s\+\-\(\)]+$/)],
      ],
    });
  }

  public async onSubmit(): Promise<void> {
    if (this.registrationForm.invalid) {
      this.registrationForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.submitSuccess = false;
    this.submitError = false;

    try {
      await this.firebaseService.addDocument(this.collectionName, {
        formData: this.registrationForm.value,
        submittedAt: new Date().toISOString(),
      });

      this.submitSuccess = true;
      this.registrationForm.reset();

      // Hide success message after 5 seconds
      setTimeout(() => {
        this.submitSuccess = false;
      }, 5000);
    } catch (error) {
      console.error('Bible course registration submission failed:', error);
      this.submitError = true;
    } finally {
      this.isSubmitting = false;
    }
  }
}
