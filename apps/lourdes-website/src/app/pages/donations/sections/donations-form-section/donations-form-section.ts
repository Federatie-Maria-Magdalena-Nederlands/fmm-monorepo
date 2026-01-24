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
  selector: 'app-donations-form-section',
  imports: [...COMPONENTS, ReactiveFormsModule, CommonModule],
  templateUrl: './donations-form-section.html',
})
export class DonationsFormSection {
  public donationForm: FormGroup;
  public currentStep = 1;
  public isSubmitting = false;
  public submitSuccess = false;
  public submitError = false;

  constructor(private formBuilder: FormBuilder) {
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

  public onSubmit(): void {
    if (this.donationForm.invalid) {
      this.donationForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.submitSuccess = false;
    this.submitError = false;

    // Simulate API call
    setTimeout(() => {
      console.log('Form submitted:', this.donationForm.value);

      // Simulate successful submission
      this.isSubmitting = false;
      this.submitSuccess = true;
      this.donationForm.reset();
      this.currentStep = 1;

      // Hide success message after 5 seconds
      setTimeout(() => {
        this.submitSuccess = false;
      }, 5000);
    }, 1500);
  }
}
