import { Component, inject, Inject, PLATFORM_ID, AfterViewInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AbstractBackground } from '../../../../shared/components/abstract-background/abstract-background';
import { HolyCommunion } from '@fmm/shared/models';
import { SacramentSubmissionService } from '../../../../shared/services/sacrament-submission.service';

declare const grecaptcha: any;

const COMPONENTS = [AbstractBackground];

@Component({
  selector: 'app-holy-communion-form-section',
  imports: [...COMPONENTS, ReactiveFormsModule, CommonModule],
  templateUrl: './holy-communion-form-section.html',
})
export class HolyCommunionFormSection implements AfterViewInit {
  public communionForm: FormGroup<any>;
  public currentStep = 1;
  public isSubmitting = false;
  public submitSuccess = false;
  public submitError = false;
  public selectedCommunicantCertificate = '';
  public selectedMotherCertificate = '';
  public selectedFatherCertificate = '';
  public selectedGodparentsCertificate = '';
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
    this.communionForm = this.formBuilder.group({
      // Step 1: Communicant Information
      communicantName: ['', Validators.required],
      communicantSurname: ['', Validators.required],
      communicantFirstName: ['', Validators.required],
      communicantDOB: ['', Validators.required],
      communicantGender: ['', Validators.required],
      communicantNationality: ['', Validators.required],
      communicantBaptized: ['', Validators.required],
      communicantBaptismDate: [''],
      communicantBaptismPlace: [''],

      // Step 2: Mother's Information
      motherFirstNames: ['', Validators.required],
      motherDOB: ['', Validators.required],
      motherPlaceOfBirth: ['', Validators.required],
      motherBaptized: ['', Validators.required],
      motherBaptismDate: [''],
      motherBaptismPlace: [''],
      motherNationality: ['', Validators.required],
      motherAddress: ['', Validators.required],
      motherPostalCity: ['', Validators.required],
      motherPhone: [
        '',
        [Validators.required, Validators.pattern(/^[\d\s\+\-\(\)]+$/)],
      ],
      motherEmail: ['', [Validators.required, Validators.email]],

      // Step 3: Father's Information
      fatherSurname: ['', Validators.required],
      fatherFirstNames: ['', Validators.required],
      fatherDOB: ['', Validators.required],
      fatherPlaceOfBirth: ['', Validators.required],
      fatherBaptized: ['', Validators.required],
      fatherBaptismDate: [''],
      fatherNationality: ['', Validators.required],
      fatherAddress: ['', Validators.required],
      fatherPostalCity: ['', Validators.required],
      fatherPhone: [
        '',
        [Validators.required, Validators.pattern(/^[\d\s\+\-\(\)]+$/)],
      ],
      fatherEmail: ['', [Validators.required, Validators.email]],

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

      // Step 5: Privacy & Additional
      privacyAgreement: ['', Validators.required],
      additionalField: [''],
    });

    // Watch for baptism status changes
    this.communionForm
      .get('communicantBaptized')
      ?.valueChanges.subscribe((value) => {
        const dateControl = this.communionForm.get('communicantBaptismDate');
        const placeControl = this.communionForm.get('communicantBaptismPlace');
        if (value === 'Yes') {
          dateControl?.setValidators(Validators.required);
          placeControl?.setValidators(Validators.required);
        } else {
          dateControl?.clearValidators();
          placeControl?.clearValidators();
        }
        dateControl?.updateValueAndValidity();
        placeControl?.updateValueAndValidity();
      });

    this.communionForm
      .get('motherBaptized')
      ?.valueChanges.subscribe((value) => {
        const dateControl = this.communionForm.get('motherBaptismDate');
        const placeControl = this.communionForm.get('motherBaptismPlace');
        if (value === 'Yes') {
          dateControl?.setValidators(Validators.required);
          placeControl?.setValidators(Validators.required);
        } else {
          dateControl?.clearValidators();
          placeControl?.clearValidators();
        }
        dateControl?.updateValueAndValidity();
        placeControl?.updateValueAndValidity();
      });

    this.communionForm
      .get('fatherBaptized')
      ?.valueChanges.subscribe((value) => {
        const dateControl = this.communionForm.get('fatherBaptismDate');
        if (value === 'Yes') {
          dateControl?.setValidators(Validators.required);
        } else {
          dateControl?.clearValidators();
        }
        dateControl?.updateValueAndValidity();
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

  public onFileSelected(event: Event, fileType: string): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const fileName = input.files[0].name;
      switch (fileType) {
        case 'communicant':
          this.selectedCommunicantCertificate = fileName;
          break;
        case 'mother':
          this.selectedMotherCertificate = fileName;
          break;
        case 'father':
          this.selectedFatherCertificate = fileName;
          break;
        case 'godparents':
          this.selectedGodparentsCertificate = fileName;
          break;
      }
    }
  }

  public nextStep(): void {
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
      'communicantName',
      'communicantSurname',
      'communicantFirstName',
      'communicantDOB',
      'communicantGender',
      'communicantNationality',
      'communicantBaptized',
    ];

    const step2Fields = [
      'motherFirstNames',
      'motherDOB',
      'motherPlaceOfBirth',
      'motherBaptized',
      'motherNationality',
      'motherAddress',
      'motherPostalCity',
      'motherPhone',
      'motherEmail',
    ];

    const step3Fields = [
      'fatherSurname',
      'fatherFirstNames',
      'fatherDOB',
      'fatherPlaceOfBirth',
      'fatherBaptized',
      'fatherNationality',
      'fatherAddress',
      'fatherPostalCity',
      'fatherPhone',
      'fatherEmail',
    ];

    const step4Fields = [
      'godparentsName',
      'godparentsSurname',
      'godparentsDOB',
      'godparentsPhone',
      'godparentsAddress',
      'godparentsPostalCity',
      'godparentsCatholic',
    ];

    const step5Fields = ['privacyAgreement'];

    let fieldsToValidate: string[] = [];

    switch (this.currentStep) {
      case 1:
        fieldsToValidate = [...step1Fields];
        if (this.communionForm.get('communicantBaptized')?.value === 'Yes') {
          fieldsToValidate.push(
            'communicantBaptismDate',
            'communicantBaptismPlace',
          );
        }
        break;
      case 2:
        fieldsToValidate = [...step2Fields];
        if (this.communionForm.get('motherBaptized')?.value === 'Yes') {
          fieldsToValidate.push('motherBaptismDate', 'motherBaptismPlace');
        }
        break;
      case 3:
        fieldsToValidate = [...step3Fields];
        if (this.communionForm.get('fatherBaptized')?.value === 'Yes') {
          fieldsToValidate.push('fatherBaptismDate');
        }
        break;
      case 4:
        fieldsToValidate = step4Fields;
        break;
      case 5:
        fieldsToValidate = step5Fields;
        break;
    }

    return fieldsToValidate.every(
      (field) => this.communionForm.get(field)?.valid,
    );
  }

  private markCurrentStepAsTouched(): void {
    const step1Fields = [
      'communicantName',
      'communicantSurname',
      'communicantFirstName',
      'communicantDOB',
      'communicantGender',
      'communicantNationality',
      'communicantBaptized',
      'communicantBaptismDate',
      'communicantBaptismPlace',
    ];

    const step2Fields = [
      'motherFirstNames',
      'motherDOB',
      'motherPlaceOfBirth',
      'motherBaptized',
      'motherBaptismDate',
      'motherBaptismPlace',
      'motherNationality',
      'motherAddress',
      'motherPostalCity',
      'motherPhone',
      'motherEmail',
    ];

    const step3Fields = [
      'fatherSurname',
      'fatherFirstNames',
      'fatherDOB',
      'fatherPlaceOfBirth',
      'fatherBaptized',
      'fatherBaptismDate',
      'fatherNationality',
      'fatherAddress',
      'fatherPostalCity',
      'fatherPhone',
      'fatherEmail',
    ];

    const step4Fields = [
      'godparentsName',
      'godparentsSurname',
      'godparentsDOB',
      'godparentsPhone',
      'godparentsAddress',
      'godparentsPostalCity',
      'godparentsCatholic',
    ];

    const step5Fields = ['privacyAgreement', 'additionalField'];

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
      this.communionForm.get(field)?.markAsTouched();
    });
  }

  public async onSubmit(): Promise<void> {
    if (this.communionForm.invalid) {
      this.communionForm.markAllAsTouched();
      return;
    }

    if (this.communionForm.get('privacyAgreement')?.value !== 'agree') {
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
        { action: 'submit_holy_communion' }
      );

      if (!this.recaptchaToken) {
        throw new Error('reCAPTCHA verification failed');
      }

      const formData: HolyCommunion = this.communionForm.value;
      const submissionId = await this.sacramentService.submitForm(
        'holy-communion',
        formData,
      );

      console.log('Holy communion form submitted successfully:', submissionId);
      this.isSubmitting = false;
      this.submitSuccess = true;
      this.communionForm.reset();
      this.currentStep = 1;
      this.selectedCommunicantCertificate = '';
      this.selectedMotherCertificate = '';
      this.selectedFatherCertificate = '';
      this.selectedGodparentsCertificate = '';

      setTimeout(() => {
        this.submitSuccess = false;
      }, 5000);
    } catch (error) {
      console.error('Error submitting holy communion form:', error);
      this.isSubmitting = false;
      this.submitError = true;

      setTimeout(() => {
        this.submitError = false;
      }, 5000);
    }
  }
}
