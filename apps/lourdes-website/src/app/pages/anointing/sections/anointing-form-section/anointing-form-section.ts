import { Component, inject, Inject, PLATFORM_ID, AfterViewInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AbstractBackground } from '../../../../shared/components/abstract-background/abstract-background';
import { Anointing } from '@fmm/shared/models';
import { SacramentSubmissionService } from '../../../../shared/services/sacrament-submission.service';

declare const grecaptcha: any;

const COMPONENTS = [AbstractBackground];

@Component({
  selector: 'app-anointing-form-section',
  imports: [...COMPONENTS, ReactiveFormsModule, CommonModule],
  templateUrl: './anointing-form-section.html',
})
export class AnointingFormSection implements AfterViewInit {
  public anointingForm: FormGroup<any>;
  public currentStep = 1;
  public isSubmitting = false;
  public submitSuccess = false;
  public submitError = false;
  private sacramentService = inject(SacramentSubmissionService);

  // reCAPTCHA properties
  recaptchaSiteKey = '6LfGVlwsAAAAAMhClqyjfucayhuUpV_wHiwulx8k';
  recaptchaToken: string | null = null;
  isBrowser: boolean;

  constructor(
    private formBuilder: FormBuilder,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.anointingForm = this.formBuilder.group({
      // Step 1: Sender Information
      senderName: ['', Validators.required],
      senderLastName: ['', Validators.required],
      senderPhone: [
        '',
        [Validators.required, Validators.pattern(/^[\d\s\+\-\(\)]+$/)],
      ],
      senderEmail: ['', [Validators.required, Validators.email]],

      // Step 2: Recipient Information
      recipientName: ['', Validators.required],
      recipientSurname: ['', Validators.required],
      recipientFirstName: ['', Validators.required],
      recipientAddress: ['', Validators.required],
      recipientPostalCity: ['', Validators.required],
      recipientDOB: ['', Validators.required],

      // Step 3: Privacy
      privacyAgreement: ['', Validators.required],
    });
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

  public nextStep(): void {
    if (!this.isCurrentStepValid()) {
      this.markCurrentStepAsTouched();
      return;
    }

    if (this.currentStep < 3) {
      this.currentStep++;
    }
  }

  public previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  private isCurrentStepValid(): boolean {
    const step1Fields = [
      'senderName',
      'senderLastName',
      'senderPhone',
      'senderEmail',
    ];

    const step2Fields = [
      'recipientName',
      'recipientSurname',
      'recipientFirstName',
      'recipientAddress',
      'recipientPostalCity',
      'recipientDOB',
    ];

    const step3Fields = ['privacyAgreement'];

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
        break;
    }

    return fieldsToValidate.every(
      (field) => this.anointingForm.get(field)?.valid,
    );
  }

  private markCurrentStepAsTouched(): void {
    const step1Fields = [
      'senderName',
      'senderLastName',
      'senderPhone',
      'senderEmail',
    ];

    const step2Fields = [
      'recipientName',
      'recipientSurname',
      'recipientFirstName',
      'recipientAddress',
      'recipientPostalCity',
      'recipientDOB',
    ];

    const step3Fields = ['privacyAgreement'];

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
        break;
    }

    fieldsToMark.forEach((field) => {
      this.anointingForm.get(field)?.markAsTouched();
    });
  }

  public async onSubmit(): Promise<void> {
    if (this.anointingForm.invalid) {
      this.anointingForm.markAllAsTouched();
      return;
    }

    if (this.anointingForm.get('privacyAgreement')?.value !== 'agree') {
      this.submitError = true;
      setTimeout(() => {
        this.submitError = false;
      }, 5000);
      return;
    }

    this.isSubmitting = true;
    this.submitSuccess = false;
    this.submitError = false;

    try {
      // Execute reCAPTCHA v3
      this.recaptchaToken = await grecaptcha.enterprise.execute(
        this.recaptchaSiteKey,
        { action: 'submit_anointing' }
      );

      if (!this.recaptchaToken) {
        throw new Error('reCAPTCHA verification failed');
      }

      const formData: Anointing = this.anointingForm.value;
      const submissionId = await this.sacramentService.submitForm(
        'anointing',
        formData,
      );

      console.log('Anointing form submitted successfully:', submissionId);
      this.isSubmitting = false;
      this.submitSuccess = true;
      this.anointingForm.reset();
      this.currentStep = 1;

      setTimeout(() => {
        this.submitSuccess = false;
      }, 5000);
    } catch (error) {
      console.error('Error submitting anointing form:', error);
      this.isSubmitting = false;
      this.submitError = true;

      setTimeout(() => {
        this.submitError = false;
      }, 5000);
    }
  }
}
