import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AbstractBackground } from '../../../../shared/components/abstract-background/abstract-background';

const COMPONENTS = [AbstractBackground];

@Component({
  selector: 'app-mass-intentions-form-section',
  imports: [...COMPONENTS, ReactiveFormsModule],
  templateUrl: './mass-intentions-form-section.html',
})
export class MassIntentionsFormSection {
  public massIntentionForm: FormGroup;
  public isSubmitting = false;
  public submitSuccess = false;
  public submitError = false;
  public selectedFileName = '';
  public selectedFile: File | null = null;

  constructor(private formBuilder: FormBuilder) {
    this.massIntentionForm = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: [
        '',
        [Validators.required, Validators.pattern(/^[\d\s\+\-\(\)]+$/)],
      ],
      desiredDate: ['', Validators.required],
      intention: ['', [Validators.required, Validators.minLength(10)]],
      moneyTransferred: [''],
    });
  }

  public onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.selectedFileName = this.selectedFile.name;
    }
  }

  public onSubmit(): void {
    if (this.massIntentionForm.invalid) {
      this.massIntentionForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.submitSuccess = false;
    this.submitError = false;

    // Simulate API call
    setTimeout(() => {
      const formData = {
        ...this.massIntentionForm.value,
        proofOfPayment: this.selectedFile ? this.selectedFile.name : null,
      };
      console.log('Form submitted:', formData);

      // Simulate successful submission
      this.isSubmitting = false;
      this.submitSuccess = true;
      this.massIntentionForm.reset();
      this.selectedFile = null;
      this.selectedFileName = '';

      // Reset file input
      const fileInput = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }

      // Hide success message after 5 seconds
      setTimeout(() => {
        this.submitSuccess = false;
      }, 5000);
    }, 1500);
  }
}
