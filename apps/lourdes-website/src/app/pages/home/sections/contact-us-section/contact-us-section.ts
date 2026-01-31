import { Component, inject, Inject, PLATFORM_ID, AfterViewInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ContactUs } from '@fmm/shared/models';
import { ContactUsSubmissionService } from '../../../../shared/services/contact-us-submission.service';

declare const grecaptcha: any;

@Component({
  selector: 'app-contact-us-section',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './contact-us-section.html',
})
export class ContactUsSection implements AfterViewInit {
  public contactForm: FormGroup;
  public isSubmitting = false;
  public submitSuccess = false;
  public submitError = false;
  private contactUsService = inject(ContactUsSubmissionService);

  // reCAPTCHA properties
  recaptchaSiteKey = '6LfGVlwsAAAAAMhClqyjfucayhuUpV_wHiwulx8k';
  recaptchaToken: string | null = null;
  isBrowser: boolean;

  constructor(
    private formBuilder: FormBuilder,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.contactForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: [
        '',
        [Validators.required, Validators.pattern(/^[\d\s\+\-\(\)]+$/)],
      ],
      message: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  public isFieldInvalid(fieldName: string): boolean {
    const field = this.contactForm.get(fieldName);
    return !!(field?.invalid && field?.touched);
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      this.loadRecaptchaScript();
    }
  }

  private loadRecaptchaScript(): void {
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/enterprise.js?render=${this.recaptchaSiteKey}`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
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
      // Execute reCAPTCHA v3
      this.recaptchaToken = await grecaptcha.enterprise.execute(
        this.recaptchaSiteKey,
        { action: 'submit_contact' }
      );

      if (!this.recaptchaToken) {
        throw new Error('reCAPTCHA verification failed');
      }

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
