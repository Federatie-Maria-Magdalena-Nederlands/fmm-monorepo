import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AbstractBackground } from '../../../../shared/components/abstract-background/abstract-background';

const COMPONENTS = [AbstractBackground];

@Component({
  selector: 'app-confirmation-form-section',
  imports: [...COMPONENTS, ReactiveFormsModule, CommonModule],
  templateUrl: './confirmation-form-section.html',
})
export class ConfirmationFormSection {
  public confirmationForm: FormGroup;
  public currentStep = 1;
  public isSubmitting = false;
  public submitSuccess = false;
  public submitError = false;
  public selectedConfirmandCertificate = '';
  public selectedMotherCertificate = '';
  public selectedFatherCertificate = '';
  public selectedSponsorCertificate = '';

  constructor(private formBuilder: FormBuilder) {
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
      const fileName = input.files[0].name;
      switch (fileType) {
        case 'confirmand':
          this.selectedConfirmandCertificate = fileName;
          break;
        case 'mother':
          this.selectedMotherCertificate = fileName;
          break;
        case 'father':
          this.selectedFatherCertificate = fileName;
          break;
        case 'sponsor':
          this.selectedSponsorCertificate = fileName;
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

  public onSubmit(): void {
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

    setTimeout(() => {
      console.log('Form submitted:', this.confirmationForm.value);

      this.isSubmitting = false;
      this.submitSuccess = true;
      this.confirmationForm.reset();
      this.currentStep = 1;
      this.selectedConfirmandCertificate = '';
      this.selectedMotherCertificate = '';
      this.selectedFatherCertificate = '';
      this.selectedSponsorCertificate = '';

      setTimeout(() => {
        this.submitSuccess = false;
      }, 5000);
    }, 1500);
  }
}
