import { Component, inject, AfterViewInit, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AbstractBackground } from '../../../../shared/components/abstract-background/abstract-background';
import { Donations } from '@fmm/shared/models';
import { DonationSubmissionService } from '../../../../shared/services/donation-submission.service';

const COMPONENTS = [AbstractBackground];

@Component({
  selector: 'app-donations-form-section',
  imports: [...COMPONENTS, ReactiveFormsModule, CommonModule],
  templateUrl: './donations-form-section.html',
})
export class DonationsFormSection implements AfterViewInit {
  public donationForm: FormGroup<any>;
  public currentStep = 1;
  public isSubmitting = false;
  public submitSuccess = false;
  public submitError = false;
  private donationService = inject(DonationSubmissionService);
  
  // reCAPTCHA properties
  public recaptchaSiteKey = '6LfGVlwsAAAAAMhClqyjfucayhuUpV_wHiwulx8k'; // Test key - replace with your actual key
  public recaptchaToken: string | null = null;
  private isBrowser: boolean;

  constructor(
    private formBuilder: FormBuilder,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    
    this.donationForm = this.formBuilder.group({
      // Step 1: Personal Information
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],

      // Step 2: Contact Information
      address1: ['', Validators.required],
      address2: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: [
        '',
        [Validators.required, Validators.pattern(/^[\d\s\+\-\(\)]+$/)],
      ],

      // Step 3: Donation Details
      donationAmount: ['', Validators.required],
      customAmount: [''],
      message: ['', [Validators.required, Validators.minLength(10)]],

      // Step 4: Payment Information
      bankAccount: ['', Validators.required],
      agreement: [false, Validators.requiredTrue],
    });

    // Watch for donation amount changes to handle custom amount validation
    this.donationForm.get('donationAmount')?.valueChanges.subscribe((value) => {
      const customAmountControl = this.donationForm.get('customAmount');
      if (value === 'custom') {
        customAmountControl?.setValidators([
          Validators.required,
          Validators.min(1),
        ]);
      } else {
        customAmountControl?.clearValidators();
      }
      customAmountControl?.updateValueAndValidity();
    });
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      this.loadRecaptchaScript();
    }
  }

  private loadRecaptchaScript(): void {
    if (typeof window !== 'undefined') {
      // Check if script already exists
      const existingScript = document.getElementById('recaptcha-script');
      if (existingScript) return;

      const script = document.createElement('script');
      script.id = 'recaptcha-script';
      script.src = 'https://www.google.com/recaptcha/enterprise.js?render=6LfGVlwsAAAAAMhClqyjfucayhuUpV_wHiwulx8k';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }

  public nextStep(): void {
    // Validate current step before proceeding
    if (!this.isCurrentStepValid()) {
      this.markCurrentStepAsTouched();
      return;
    }

    if (this.currentStep < 4) {
      this.currentStep++;
    }
  }

  public previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  private isCurrentStepValid(): boolean {
    const step1Fields = ['firstName', 'lastName'];
    const step2Fields = ['address1', 'address2', 'email', 'phoneNumber'];
    const step3Fields = ['donationAmount', 'message'];
    const step4Fields = ['bankAccount', 'agreement'];

    let fieldsToValidate: string[] = [];

    switch (this.currentStep) {
      case 1:
        fieldsToValidate = step1Fields;
        break;
      case 2:
        fieldsToValidate = step2Fields;
        break;
      case 3:
        fieldsToValidate = step3Fields;
        // Add custom amount if selected
        if (this.donationForm.get('donationAmount')?.value === 'custom') {
          fieldsToValidate.push('customAmount');
        }
        break;
      case 4:
        fieldsToValidate = step4Fields;
        break;
    }

    return fieldsToValidate.every(
      (field) => this.donationForm.get(field)?.valid,
    );
  }

  private markCurrentStepAsTouched(): void {
    const step1Fields = ['firstName', 'lastName'];
    const step2Fields = ['address1', 'address2', 'email', 'phoneNumber'];
    const step3Fields = ['donationAmount', 'message'];
    const step4Fields = ['bankAccount', 'agreement'];

    let fieldsToMark: string[] = [];

    switch (this.currentStep) {
      case 1:
        fieldsToMark = step1Fields;
        break;
      case 2:
        fieldsToMark = step2Fields;
        break;
      case 3:
        fieldsToMark = step3Fields;
        if (this.donationForm.get('donationAmount')?.value === 'custom') {
          fieldsToMark.push('customAmount');
        }
        break;
      case 4:
        fieldsToMark = step4Fields;
        break;
    }

    fieldsToMark.forEach((field) => {
      this.donationForm.get(field)?.markAsTouched();
    });
  }

  public async onSubmit(): Promise<void> {
    if (this.donationForm.invalid) {
      this.donationForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.submitSuccess = false;
    this.submitError = false;

    try {
      // Execute reCAPTCHA v3 to get token
      if (typeof (window as any).grecaptcha !== 'undefined' && (window as any).grecaptcha.enterprise) {
        this.recaptchaToken = await (window as any).grecaptcha.enterprise.execute(
          this.recaptchaSiteKey,
          { action: 'submit_donation' }
        );
      }

      // Validate reCAPTCHA token was obtained
      if (!this.recaptchaToken) {
        throw new Error('Failed to obtain reCAPTCHA token');
      }

      const formData: Donations = this.donationForm.value;
      const submissionId = await this.donationService.submitForm(formData);

      console.log('Donation form submitted successfully:', submissionId);
      this.isSubmitting = false;
      this.submitSuccess = true;
      this.donationForm.reset();
      this.currentStep = 1;
      this.recaptchaToken = null;

      // Hide success message after 5 seconds
      setTimeout(() => {
        this.submitSuccess = false;
      }, 5000);
    } catch (error) {
      console.error('Error submitting donation form:', error);
      this.isSubmitting = false;
      this.submitError = true;

      // Hide error message after 5 seconds
      setTimeout(() => {
        this.submitError = false;
      }, 5000);
    }
  }
}
