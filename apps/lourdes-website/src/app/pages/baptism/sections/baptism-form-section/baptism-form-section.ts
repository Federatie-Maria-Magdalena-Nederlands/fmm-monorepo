import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AbstractBackground } from '../../../../shared/components/abstract-background/abstract-background';
import { Baptism } from '@fmm/shared/models';
import { SacramentSubmissionService } from '../../../../shared/services/sacrament-submission.service';

const COMPONENTS = [AbstractBackground];

@Component({
  selector: 'app-baptism-form-section',
  imports: [...COMPONENTS, ReactiveFormsModule, CommonModule],
  templateUrl: './baptism-form-section.html',
})
export class BaptismFormSection {
  public baptismForm: FormGroup<any>;
  public currentStep = 1;
  public isSubmitting = false;
  public submitSuccess = false;
  public submitError = false;
  private sacramentService = inject(SacramentSubmissionService);

  constructor(private formBuilder: FormBuilder) {
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
      const formData: Baptism = this.baptismForm.value;
      const submissionId = await this.sacramentService.submitForm(
        'baptism',
        formData
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
