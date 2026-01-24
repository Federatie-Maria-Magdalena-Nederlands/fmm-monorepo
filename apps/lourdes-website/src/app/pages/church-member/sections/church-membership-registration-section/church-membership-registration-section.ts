import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AbstractBackground } from '../../../../shared/components/abstract-background/abstract-background';
import { ChurchMember } from '@fmm/shared/models';
import { JoinUsSubmissionService } from '../../../../shared/services/join-us-submission.service';

const COMPONENTS = [AbstractBackground];

@Component({
  selector: 'app-church-membership-registration-section',
  imports: [...COMPONENTS, ReactiveFormsModule],
  templateUrl: './church-membership-registration-section.html',
})
export class ChurchMembershipRegistrationSection {
  public registrationForm: FormGroup;
  public currentStep = 0;
  public isSubmitting = false;
  public submitSuccess = false;
  public submitError = false;
  private joinUsService = inject(JoinUsSubmissionService);

  public steps = [
    'Personal',
    'Address',
    'Religious',
    'Marital',
    'Spouse',
    'Additional',
  ];

  public maritalStatuses = [
    'Married',
    'Unmarried',
    'Living together',
    'Single',
    'Surviving partner',
    'Registered partnership',
    'Separated',
    'Relationship dissolved',
    'Widowhood',
  ];

  constructor(private formBuilder: FormBuilder) {
    this.registrationForm = this.formBuilder.group({
      // Step 1: Personal Information
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      gender: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: [
        '',
        [Validators.required, Validators.pattern(/^[\d\s\+\-\(\)]+$/)],
      ],

      // Step 2: Address Information
      address: ['', Validators.required],
      postalCodeCity: ['', Validators.required],
      mainResident: ['', Validators.required],

      // Step 3: Religious Information
      baptizedCatholic: ['', Validators.required],

      // Step 4: Marital Information
      maritalStatus: ['', Validators.required],
      weddingDate: [''],
      dissolutionDate: [''],
      widowedSince: [''],

      // Step 5: Spouse Information
      spouseSurname: [''],
      spouseFirstNames: [''],
      spouseBirthDate: [''],
      spouseBirthPlace: [''],

      // Step 6: Additional Information
      familyMembers: [''],
      questions: [''],
    });
  }

  public nextStep(): void {
    if (this.isCurrentStepValid()) {
      this.currentStep++;
    } else {
      this.markCurrentStepAsTouched();
    }
  }

  public previousStep(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  private isCurrentStepValid(): boolean {
    const stepFields = this.getStepFields(this.currentStep);
    return stepFields.every((field) => {
      const control = this.registrationForm.get(field);
      return control?.valid || control?.disabled;
    });
  }

  private markCurrentStepAsTouched(): void {
    const stepFields = this.getStepFields(this.currentStep);
    stepFields.forEach((field) => {
      this.registrationForm.get(field)?.markAsTouched();
    });
  }

  private getStepFields(step: number): string[] {
    const stepFieldsMap: { [key: number]: string[] } = {
      0: ['firstName', 'lastName', 'gender', 'email', 'phoneNumber'],
      1: ['address', 'postalCodeCity', 'mainResident'],
      2: ['baptizedCatholic'],
      3: ['maritalStatus'],
      4: [], // Spouse info fields are optional
      5: [], // Additional info fields are optional
    };
    return stepFieldsMap[step] || [];
  }

  public isFieldInvalid(fieldName: string): boolean {
    const field = this.registrationForm.get(fieldName);
    return !!(field?.invalid && field?.touched);
  }

  public showMaritalDateFields(): boolean {
    const status = this.registrationForm.get('maritalStatus')?.value;
    return [
      'Married',
      'Separated',
      'Relationship dissolved',
      'Widowhood',
    ].includes(status);
  }

  public showWeddingDate(): boolean {
    const status = this.registrationForm.get('maritalStatus')?.value;
    return [
      'Married',
      'Separated',
      'Relationship dissolved',
      'Widowhood',
    ].includes(status);
  }

  public showDissolutionDate(): boolean {
    const status = this.registrationForm.get('maritalStatus')?.value;
    return ['Separated', 'Relationship dissolved'].includes(status);
  }

  public showWidowedSince(): boolean {
    const status = this.registrationForm.get('maritalStatus')?.value;
    return status === 'Widowhood';
  }

  public requiresSpouseInfo(): boolean {
    const status = this.registrationForm.get('maritalStatus')?.value;
    return [
      'Married',
      'Living together',
      'Registered partnership',
      'Separated',
      'Relationship dissolved',
      'Widowhood',
    ].includes(status);
  }

  public async onSubmit(): Promise<void> {
    if (this.registrationForm.invalid) {
      this.registrationForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.submitSuccess = false;
    this.submitError = false;

    try {
      const formData: ChurchMember = this.registrationForm.value;
      const submissionId = await this.joinUsService.submitForm(
        'church-member',
        formData,
      );

      console.log(
        'Church membership form submitted successfully:',
        submissionId,
      );
      this.isSubmitting = false;
      this.submitSuccess = true;
      this.registrationForm.reset();
      this.currentStep = 0;

      // Hide success message after 5 seconds
      setTimeout(() => {
        this.submitSuccess = false;
      }, 5000);
    } catch (error) {
      console.error('Error submitting church membership form:', error);
      this.isSubmitting = false;
      this.submitError = true;

      // Hide error message after 5 seconds
      setTimeout(() => {
        this.submitError = false;
      }, 5000);
    }
  }
}
