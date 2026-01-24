import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ContactUs } from '@fmm/shared/models';
import { ContactUsSubmissionService } from '../../../../shared/services/contact-us-submission.service';

@Component({
  selector: 'app-contact-us-section',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './contact-us-section.html',
})
export class ContactUsSection {
  public contactForm: FormGroup;
  public isSubmitting = false;
  public submitSuccess = false;
  public submitError = false;
  private contactUsService = inject(ContactUsSubmissionService);

  constructor(private formBuilder: FormBuilder) {
    this.contactForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[\d\s\+\-\(\)]+$/)]],
      message: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  public isFieldInvalid(fieldName: string): boolean {
    const field = this.contactForm.get(fieldName);
    return !!(field?.invalid && field?.touched);
  }

  public async onSubmit(): Promise<void> {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.submitSuccess = false;
    this.submitError = false;

    try {
      const formData: ContactUs = this.contactForm.value;
      const submissionId = await this.contactUsService.submitForm(formData);
      
      console.log('Contact form submitted successfully:', submissionId);
      this.isSubmitting = false;
      this.submitSuccess = true;
      this.contactForm.reset();

      // Hide success message after 5 seconds
      setTimeout(() => {
        this.submitSuccess = false;
      }, 5000);
    } catch (error) {
      console.error('Error submitting contact form:', error);
      this.isSubmitting = false;
      this.submitError = true;

      // Hide error message after 5 seconds
      setTimeout(() => {
        this.submitError = false;
      }, 5000);
    }
  }
}
