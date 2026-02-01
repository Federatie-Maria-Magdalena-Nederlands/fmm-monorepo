import { Component, inject, Inject, PLATFORM_ID, AfterViewInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AbstractBackground } from '../../../../shared/components/abstract-background/abstract-background';
import { Confirmation } from '@fmm/shared/models';
import { SacramentSubmissionService } from '../../../../shared/services/sacrament-submission.service';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

declare const grecaptcha: any;

const COMPONENTS = [AbstractBackground];

@Component({
  selector: 'app-confirmation-form-section',
  imports: [...COMPONENTS, ReactiveFormsModule, CommonModule],
  templateUrl: './confirmation-form-section.html',
})
export class ConfirmationFormSection implements AfterViewInit {
  public confirmationForm: FormGroup<any>;
  public currentStep = 1;
  public isSubmitting = false;
  public submitSuccess = false;
  public submitError = false;
  public selectedConfirmandCertificate = '';
  public selectedMotherCertificate = '';
  public selectedFatherCertificate = '';
  public selectedSponsorCertificate = '';
  private confirmandCertificateFile: File | null = null;
  private motherCertificateFile: File | null = null;
  private fatherCertificateFile: File | null = null;
  private sponsorCertificateFile: File | null = null;
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
    this.confirmationForm = this.formBuilder.group({
      // Step 1: Confirmand Information
      confirmandName: ['', Validators.required],
      confirmandSurname: ['', Validators.required],
      confirmandFirstName: ['', Validators.required],
      confirmandDOB: ['', Validators.required],
      confirmandGender: ['', Validators.required],
      confirmandNationality: ['', Validators.required],
      confirmandBaptized: ['', Validators.required],
      confirmandBaptismDate: [''],
      confirmandBaptismPlace: [''],
      confirmandParishName: [''],

      // Step 2: Mother's Information
      motherSurname: ['', Validators.required],
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

      // Step 4: Sponsor Information
      sponsorName: ['', Validators.required],
      sponsorSurname: ['', Validators.required],
      sponsorDOB: ['', Validators.required],
      sponsorPhone: [
        '',
        [Validators.required, Validators.pattern(/^[\d\s\+\-\(\)]+$/)],
      ],
      sponsorAddress: ['', Validators.required],
      sponsorPostalCity: ['', Validators.required],
      sponsorCatholic: ['', Validators.required],

      // Step 5: Privacy & Additional
      privacyAgreement: ['', Validators.required],
      additionalField: [''],
    });

    // Watch for baptism status changes
    this.confirmationForm
      .get('confirmandBaptized')
      ?.valueChanges.subscribe((value) => {
        const dateControl = this.confirmationForm.get('confirmandBaptismDate');
        const placeControl = this.confirmationForm.get(
          'confirmandBaptismPlace',
        );
        const parishControl = this.confirmationForm.get('confirmandParishName');
        if (value === 'Yes') {
          dateControl?.setValidators(Validators.required);
          placeControl?.setValidators(Validators.required);
          parishControl?.setValidators(Validators.required);
        } else {
          dateControl?.clearValidators();
          placeControl?.clearValidators();
          parishControl?.clearValidators();
        }
        dateControl?.updateValueAndValidity();
        placeControl?.updateValueAndValidity();
        parishControl?.updateValueAndValidity();
      });

    this.confirmationForm
      .get('motherBaptized')
      ?.valueChanges.subscribe((value) => {
        const dateControl = this.confirmationForm.get('motherBaptismDate');
        const placeControl = this.confirmationForm.get('motherBaptismPlace');
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

    this.confirmationForm
      .get('fatherBaptized')
      ?.valueChanges.subscribe((value) => {
        const dateControl = this.confirmationForm.get('fatherBaptismDate');
        if (value === 'Yes') {
          dateControl?.setValidators(Validators.required);
        } else {
          dateControl?.clearValidators();
        }
        dateControl?.updateValueAndValidity();
      });
  }

  public onFileSelected(event: Event, fileType: string): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const fileName = file.name;
      
      switch (fileType) {
        case 'confirmand':
          this.selectedConfirmandCertificate = fileName;
          this.confirmandCertificateFile = file;
          break;
        case 'mother':
          this.selectedMotherCertificate = fileName;
          this.motherCertificateFile = file;
          break;
        case 'father':
          this.selectedFatherCertificate = fileName;
          this.fatherCertificateFile = file;
          break;
        case 'sponsor':
          this.selectedSponsorCertificate = fileName;
          this.sponsorCertificateFile = file;
          break;
      }
    }
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

  private async uploadFile(file: File, folder: string): Promise<string | null> {
    try {
      const storage = getStorage();
      const timestamp = Date.now();
      const fileName = `${folder}/${timestamp}_${file.name}`;
      const storageRef = ref(storage, fileName);
      
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      return downloadURL;
    } catch (error) {
      console.error('Error uploading file:', error);
      return null;
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
      'confirmandName',
      'confirmandSurname',
      'confirmandFirstName',
      'confirmandDOB',
      'confirmandGender',
      'confirmandNationality',
      'confirmandBaptized',
    ];

    const step2Fields = [
      'motherSurname',
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
      'sponsorName',
      'sponsorSurname',
      'sponsorDOB',
      'sponsorPhone',
      'sponsorAddress',
      'sponsorPostalCity',
      'sponsorCatholic',
    ];

    const step5Fields = ['privacyAgreement'];

    let fieldsToValidate: string[] = [];

    switch (this.currentStep) {
      case 1:
        fieldsToValidate = [...step1Fields];
        if (this.confirmationForm.get('confirmandBaptized')?.value === 'Yes') {
          fieldsToValidate.push(
            'confirmandBaptismDate',
            'confirmandBaptismPlace',
            'confirmandParishName',
          );
        }
        break;
      case 2:
        fieldsToValidate = [...step2Fields];
        if (this.confirmationForm.get('motherBaptized')?.value === 'Yes') {
          fieldsToValidate.push('motherBaptismDate', 'motherBaptismPlace');
        }
        break;
      case 3:
        fieldsToValidate = [...step3Fields];
        if (this.confirmationForm.get('fatherBaptized')?.value === 'Yes') {
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
      (field) => this.confirmationForm.get(field)?.valid,
    );
  }

  private markCurrentStepAsTouched(): void {
    const step1Fields = [
      'confirmandName',
      'confirmandSurname',
      'confirmandFirstName',
      'confirmandDOB',
      'confirmandGender',
      'confirmandNationality',
      'confirmandBaptized',
      'confirmandBaptismDate',
      'confirmandBaptismPlace',
      'confirmandParishName',
    ];

    const step2Fields = [
      'motherSurname',
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
      'sponsorName',
      'sponsorSurname',
      'sponsorDOB',
      'sponsorPhone',
      'sponsorAddress',
      'sponsorPostalCity',
      'sponsorCatholic',
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
      this.confirmationForm.get(field)?.markAsTouched();
    });
  }

  public async onSubmit(): Promise<void> {
    if (this.confirmationForm.invalid) {
      this.confirmationForm.markAllAsTouched();
      return;
    }

    if (this.confirmationForm.get('privacyAgreement')?.value !== 'agree') {
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
        { action: 'submit_confirmation' }
      );

      if (!this.recaptchaToken) {
        throw new Error('reCAPTCHA verification failed');
      }

      // Upload certificate files to Firebase Storage
      const uploadedUrls: any = {};
      
      if (this.confirmandCertificateFile) {
        const url = await this.uploadFile(this.confirmandCertificateFile, 'confirmation/confirmand-certificates');
        if (url) uploadedUrls.confirmandCertificateUrl = url;
      }
      
      if (this.motherCertificateFile) {
        const url = await this.uploadFile(this.motherCertificateFile, 'confirmation/mother-certificates');
        if (url) uploadedUrls.motherCertificateUrl = url;
      }
      
      if (this.fatherCertificateFile) {
        const url = await this.uploadFile(this.fatherCertificateFile, 'confirmation/father-certificates');
        if (url) uploadedUrls.fatherCertificateUrl = url;
      }
      
      if (this.sponsorCertificateFile) {
        const url = await this.uploadFile(this.sponsorCertificateFile, 'confirmation/sponsor-certificates');
        if (url) uploadedUrls.sponsorCertificateUrl = url;
      }

      const formData: Confirmation = {
        ...this.confirmationForm.value,
        ...uploadedUrls,
      };
      
      const submissionId = await this.sacramentService.submitForm(
        'confirmation',
        formData,
      );

      console.log('Confirmation form submitted successfully:', submissionId);
      this.isSubmitting = false;
      this.submitSuccess = true;
      this.confirmationForm.reset();
      this.currentStep = 1;
      this.selectedConfirmandCertificate = '';
      this.selectedMotherCertificate = '';
      this.selectedFatherCertificate = '';
      this.selectedSponsorCertificate = '';
      this.confirmandCertificateFile = null;
      this.motherCertificateFile = null;
      this.fatherCertificateFile = null;
      this.sponsorCertificateFile = null;

      setTimeout(() => {
        this.submitSuccess = false;
      }, 5000);
    } catch (error) {
      console.error('Error submitting confirmation form:', error);
      this.isSubmitting = false;
      this.submitError = true;

      setTimeout(() => {
        this.submitError = false;
      }, 5000);
    }
  }
}
