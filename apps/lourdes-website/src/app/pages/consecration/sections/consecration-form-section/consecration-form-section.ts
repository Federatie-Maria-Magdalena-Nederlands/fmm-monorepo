import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AbstractBackground } from '../../../../shared/components/abstract-background/abstract-background';
import { Consecration } from '@fmm/shared/models';
import { SacramentSubmissionService } from '../../../../shared/services/sacrament-submission.service';

const COMPONENTS = [AbstractBackground];

@Component({
  selector: 'app-consecration-form-section',
  imports: [...COMPONENTS, ReactiveFormsModule, CommonModule],
  templateUrl: './consecration-form-section.html',
})
export class ConsecrationFormSection {
  public consecrationForm: FormGroup<any>;
  public currentStep = 1;
  public isSubmitting = false;
  public submitSuccess = false;
  public submitError = false;
  private sacramentService = inject(SacramentSubmissionService);

  constructor(private formBuilder: FormBuilder) {
    this.consecrationForm = this.formBuilder.group({
      // Step 1: Personal Information
      name: ['', Validators.required],
      lastName: ['', Validators.required],
      mobilePhone: [
        '',
        [Validators.required, Validators.pattern(/^[\d\s\+\-\(\)]+$/)],
      ],
      emailAddress: ['', [Validators.required, Validators.email]],

      // Step 2: Privacy
      privacyAgreement: ['', Validators.required],
    });
  }

  public nextStep(): void {
    if (!this.isCurrentStepValid()) {
      this.markCurrentStepAsTouched();
      return;
    }

    if (this.currentStep < 2) {
      this.currentStep++;
    }
  }

  public previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  private isCurrentStepValid(): boolean {
    const step1Fields = ['name', 'lastName', 'mobilePhone', 'emailAddress'];

    const step2Fields = ['privacyAgreement'];

    let fieldsToValidate: string[] = [];

    switch (this.currentStep) {
      case 1:
        fieldsToValidate = step1Fields;
        break;
      case 2:
        fieldsToValidate = step2Fields;
        break;
    }

    return fieldsToValidate.every(
      (field) => this.consecrationForm.get(field)?.valid,
    );
  }

  private markCurrentStepAsTouched(): void {
    const step1Fields = ['name', 'lastName', 'mobilePhone', 'emailAddress'];

    const step2Fields = ['privacyAgreement'];

    let fieldsToMark: string[] = [];

    switch (this.currentStep) {
      case 1:
        fieldsToMark = step1Fields;
        break;
      case 2:
        fieldsToMark = step2Fields;
        break;
    }

    fieldsToMark.forEach((field) => {
      this.consecrationForm.get(field)?.markAsTouched();
    });
  }

  public async onSubmit(): Promise<void> {
    if (this.consecrationForm.invalid) {
      this.consecrationForm.markAllAsTouched();
      return;
    }

    if (this.consecrationForm.get('privacyAgreement')?.value !== 'agree') {
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
      const formData: Consecration = this.consecrationForm.value;
      const submissionId = await this.sacramentService.submitForm(
        'consecration',
        formData
      );
      
      console.log('Consecration form submitted successfully:', submissionId);
      this.isSubmitting = false;
      this.submitSuccess = true;
      this.consecrationForm.reset();
      this.currentStep = 1;

      setTimeout(() => {
        this.submitSuccess = false;
      }, 5000);
    } catch (error) {
      console.error('Error submitting consecration form:', error);
      this.isSubmitting = false;
      this.submitError = true;

      setTimeout(() => {
        this.submitError = false;
      }, 5000);
    }
  }
}
