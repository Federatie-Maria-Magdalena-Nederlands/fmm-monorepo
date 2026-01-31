import { Component, inject, Inject, PLATFORM_ID, AfterViewInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AbstractBackground } from '../../../../shared/components/abstract-background/abstract-background';
import { Baptism } from '@fmm/shared/models';
import { SacramentSubmissionService } from '../../../../shared/services/sacrament-submission.service';

declare const grecaptcha: any;

const COMPONENTS = [AbstractBackground];

@Component({
  selector: 'app-baptism-form-section',
  imports: [...COMPONENTS, ReactiveFormsModule, CommonModule],
  templateUrl: './baptism-form-section.html',
})
export class BaptismFormSection implements AfterViewInit {
  public baptismForm: FormGroup<any>;
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
    this.baptismForm = this.formBuilder.group({
      // Step 1: Sender Information
      senderFirstName: ['', [Validators.required, Validators.minLength(2)]],
      senderLastName: ['', [Validators.required, Validators.minLength(2)]],
      senderPhone: [
        '',
        [Validators.required, Validators.pattern(/^[\d\s\+\-\(\)]+$/)],
      ],
      senderEmail: ['', [Validators.required, Validators.email]],

      // Step 2: Recipient Information
      sacramentType: ['', Validators.required],
      recipientName: ['', Validators.required],
      recipientSurname: ['', Validators.required],
      recipientFirstName: ['', Validators.required],
      recipientAddress: ['', Validators.required],
      recipientPostalCity: ['', Validators.required],
      recipientDOB: ['', Validators.required],
      recipientPlaceOfBirth: ['', Validators.required],
      recipientNationality: ['', Validators.required],

      // Step 3: Parents Information
      motherName: ['', Validators.required],
      fatherName: ['', Validators.required],
      fatherSurname: ['', Validators.required],

      // Step 4: Godparents Information
      godparentsName: ['', Validators.required],
      godparentsSurname: ['', Validators.required],
      godparentsDOB: ['', Validators.required],
      godparentsPhone: [
        '',
        [Validators.required, Validators.pattern(/^[\d\s\+\-\(\)]+$/)],
      ],
      godparentsAddress: ['', Validators.required],
      godparentsPostalCity: ['', Validators.required],
      godparentsCatholic: ['', Validators.required],

      // Step 5: Privacy & Date Selection
      privacyAgreement: ['', Validators.required],
      baptismDate: ['', Validators.required],
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
    // Validate current step before proceeding
    if (!this.isCurrentStepValid()) {
      this.markCurrentStepAsTouched();
      return;
    }

    if (this.currentStep < 5) {
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
      'senderFirstName',
      'senderLastName',
      'senderPhone',
      'senderEmail',
    ];
    const step2Fields = [
      'sacramentType',
      'recipientName',
      'recipientSurname',
      'recipientFirstName',
      'recipientAddress',
      'recipientPostalCity',
      'recipientDOB',
      'recipientPlaceOfBirth',
      'recipientNationality',
    ];
    const step3Fields = ['motherName', 'fatherName', 'fatherSurname'];
    const step4Fields = [
      'godparentsName',
      'godparentsSurname',
      'godparentsDOB',
      'godparentsPhone',
      'godparentsAddress',
      'godparentsPostalCity',
      'godparentsCatholic',
    ];
    const step5Fields = ['privacyAgreement', 'baptismDate'];

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
      case 4:
        fieldsToValidate = step4Fields;
        break;
      case 5:
        fieldsToValidate = step5Fields;
        break;
    }

    return fieldsToValidate.every(
      (field) => this.baptismForm.get(field)?.valid,
    );
  }

  private markCurrentStepAsTouched(): void {
    const step1Fields = [
      'senderFirstName',
      'senderLastName',
      'senderPhone',
      'senderEmail',
    ];
    const step2Fields = [
      'sacramentType',
      'recipientName',
      'recipientSurname',
      'recipientFirstName',
      'recipientAddress',
      'recipientPostalCity',
      'recipientDOB',
      'recipientPlaceOfBirth',
      'recipientNationality',
    ];
    const step3Fields = ['motherName', 'fatherName', 'fatherSurname'];
    const step4Fields = [
      'godparentsName',
      'godparentsSurname',
      'godparentsDOB',
      'godparentsPhone',
      'godparentsAddress',
      'godparentsPostalCity',
      'godparentsCatholic',
    ];
    const step5Fields = ['privacyAgreement', 'baptismDate'];

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
      case 4:
        fieldsToMark = step4Fields;
        break;
      case 5:
        fieldsToMark = step5Fields;
        break;
    }

    fieldsToMark.forEach((field) => {
      this.baptismForm.get(field)?.markAsTouched();
    });
  }

  public async onSubmit(): Promise<void> {
    if (this.baptismForm.invalid) {
      this.baptismForm.markAllAsTouched();
      return;
    }

    // Check if privacy agreement is 'agree'
    if (this.baptismForm.get('privacyAgreement')?.value !== 'agree') {
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
        { action: 'submit_baptism' }
      );

      if (!this.recaptchaToken) {
        throw new Error('reCAPTCHA verification failed');
      }

      const formData: Baptism = this.baptismForm.value;
      const submissionId = await this.sacramentService.submitForm(
        'baptism',
        formData,
      );

      console.log('Baptism form submitted successfully:', submissionId);
      this.isSubmitting = false;
      this.submitSuccess = true;
      this.baptismForm.reset();
      this.currentStep = 1;

      // Hide success message after 5 seconds
      setTimeout(() => {
        this.submitSuccess = false;
      }, 5000);
    } catch (error) {
      console.error('Error submitting baptism form:', error);
      this.isSubmitting = false;
      this.submitError = true;

      // Hide error message after 5 seconds
      setTimeout(() => {
        this.submitError = false;
      }, 5000);
    }
  }
}
