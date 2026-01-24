import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AbstractBackground } from '../../../../shared/components/abstract-background/abstract-background';
import { Wedding } from '@fmm/shared/models';
import { SacramentSubmissionService } from '../../../../shared/services/sacrament-submission.service';

const COMPONENTS = [AbstractBackground];

@Component({
  selector: 'app-wedding-form-section',
  imports: [...COMPONENTS, ReactiveFormsModule, CommonModule],
  templateUrl: './wedding-form-section.html',
})
export class WeddingFormSection {
  public weddingForm: FormGroup<any>;
  public currentStep = 1;
  public isSubmitting = false;
  public submitSuccess = false;
  public submitError = false;
  private sacramentService = inject(SacramentSubmissionService);

  constructor(private formBuilder: FormBuilder) {
    this.weddingForm = this.formBuilder.group({
      // Step 1: Bride Information
      brideName: ['', Validators.required],
      brideLastName: ['', Validators.required],
      brideDOB: ['', Validators.required],
      bridePhone: [
        '',
        [Validators.required, Validators.pattern(/^[\d\s\+\-\(\)]+$/)],
      ],
      brideEmail: ['', [Validators.required, Validators.email]],
      brideAddress: ['', Validators.required],
      bridePostalCity: ['', Validators.required],

      // Step 2: Groom Information
      groomName: ['', Validators.required],
      groomSurname: ['', Validators.required],
      groomDOB: ['', Validators.required],
      groomPhone: [
        '',
        [Validators.required, Validators.pattern(/^[\d\s\+\-\(\)]+$/)],
      ],
      groomAddress: ['', Validators.required],
      groomPostalCity: ['', Validators.required],
      groomEmail: ['', [Validators.required, Validators.email]],
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

      // Step 3: Privacy
      privacyAgreement: ['', Validators.required],
    });
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
      'brideName',
      'brideLastName',
      'brideDOB',
      'bridePhone',
      'brideEmail',
      'brideAddress',
      'bridePostalCity',
    ];

    const step2Fields = [
      'groomName',
      'groomSurname',
      'groomDOB',
      'groomPhone',
      'groomAddress',
      'groomPostalCity',
      'groomEmail',
      'godparentsName',
      'godparentsSurname',
      'godparentsDOB',
      'godparentsPhone',
      'godparentsAddress',
      'godparentsPostalCity',
      'godparentsCatholic',
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
      (field) => this.weddingForm.get(field)?.valid,
    );
  }

  private markCurrentStepAsTouched(): void {
    const step1Fields = [
      'brideName',
      'brideLastName',
      'brideDOB',
      'bridePhone',
      'brideEmail',
      'brideAddress',
      'bridePostalCity',
    ];

    const step2Fields = [
      'groomName',
      'groomSurname',
      'groomDOB',
      'groomPhone',
      'groomAddress',
      'groomPostalCity',
      'groomEmail',
      'godparentsName',
      'godparentsSurname',
      'godparentsDOB',
      'godparentsPhone',
      'godparentsAddress',
      'godparentsPostalCity',
      'godparentsCatholic',
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
      this.weddingForm.get(field)?.markAsTouched();
    });
  }

  public async onSubmit(): Promise<void> {
    if (this.weddingForm.invalid) {
      this.weddingForm.markAllAsTouched();
      return;
    }

    if (this.weddingForm.get('privacyAgreement')?.value !== 'agree') {
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
      const formData: Wedding = this.weddingForm.value;
      const submissionId = await this.sacramentService.submitForm(
        'wedding',
        formData,
      );

      console.log('Wedding form submitted successfully:', submissionId);
      this.isSubmitting = false;
      this.submitSuccess = true;
      this.weddingForm.reset();
      this.currentStep = 1;

      setTimeout(() => {
        this.submitSuccess = false;
      }, 5000);
    } catch (error) {
      console.error('Error submitting wedding form:', error);
      this.isSubmitting = false;
      this.submitError = true;

      setTimeout(() => {
        this.submitError = false;
      }, 5000);
    }
  }
}
