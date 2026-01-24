import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AbstractBackground } from '../../../../shared/components/abstract-background/abstract-background';
import { MassIntentions } from '@fmm/shared/models';
import { MassIntentionSubmissionService } from '../../../../shared/services/mass-intention-submission.service';

const COMPONENTS = [AbstractBackground];

@Component({
  selector: 'app-mass-intentions-form-section',
  imports: [...COMPONENTS, ReactiveFormsModule],
  templateUrl: './mass-intentions-form-section.html',
})
export class MassIntentionsFormSection {
  public massIntentionForm: FormGroup<any>;
  public isSubmitting = false;
  public submitSuccess = false;
  public submitError = false;
  public selectedFileName = '';
  public selectedFile: File | null = null;
  private massIntentionService = inject(MassIntentionSubmissionService);

  constructor(private formBuilder: FormBuilder) {
    this.massIntentionForm = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: [
        '',
        [Validators.required, Validators.pattern(/^[\d\s\+\-\(\)]+$/)],
      ],
      desiredDate: ['', Validators.required],
      intention: ['', [Validators.required, Validators.minLength(10)]],
      moneyTransferred: [''],
    });
  }

  public onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.selectedFileName = this.selectedFile.name;
    }
  }

  public async onSubmit(): Promise<void> {
    if (this.massIntentionForm.invalid) {
      this.massIntentionForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.submitSuccess = false;
    this.submitError = false;

    try {
      const formData: MassIntentions = {
        ...this.massIntentionForm.value,
        proofOfPayment: this.selectedFile ? this.selectedFile.name : null,
      };
      
      const submissionId = await this.massIntentionService.submitForm(
        formData
      );
      
      console.log('Mass intention form submitted successfully:', submissionId);
      this.isSubmitting = false;
      this.submitSuccess = true;
      this.massIntentionForm.reset();
      this.selectedFile = null;
      this.selectedFileName = '';

      // Reset file input
      const fileInput = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }

      // Hide success message after 5 seconds
      setTimeout(() => {
        this.submitSuccess = false;
      }, 5000);
    } catch (error) {
      console.error('Error submitting mass intention form:', error);
      this.isSubmitting = false;
      this.submitError = true;

      // Hide error message after 5 seconds
      setTimeout(() => {
        this.submitError = false;
      }, 5000);
    }
  }
}
