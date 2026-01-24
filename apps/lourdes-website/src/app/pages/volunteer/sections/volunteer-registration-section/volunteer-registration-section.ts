import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AbstractBackground } from '../../../../shared/components/abstract-background/abstract-background';
import { Volunteer } from '@fmm/shared/models';
import { JoinUsSubmissionService } from '../../../../shared/services/join-us-submission.service';

const COMPONENTS = [AbstractBackground];

interface VolunteerOption {
  value: string;
  label: string;
  description?: string;
}

@Component({
  selector: 'app-volunteer-registration-section',
  imports: [...COMPONENTS, ReactiveFormsModule],
  templateUrl: './volunteer-registration-section.html',
})
export class VolunteerRegistrationSection {
  public volunteerForm: FormGroup;
  public isSubmitting = false;
  public submitSuccess = false;
  public submitError = false;
  private joinUsService = inject(JoinUsSubmissionService);

  public volunteerOptions: VolunteerOption[] = [
    {
      value: 'parish_council',
      label: 'Member of the parish council',
      description:
        'Makes decisions on important matters and supports the priests',
    },
    {
      value: 'secretary',
      label: 'Secretary',
      description: 'Handles administration and communication',
    },
    {
      value: 'lectors',
      label: 'Lectors',
      description: 'Read first and second readings',
    },
    {
      value: 'baptism_committee',
      label: 'Baptism Committee',
      description:
        'Prepares parents and baptismal families for the baptism of their child',
    },
    {
      value: 'treasurer',
      label: 'Treasurer',
      description: 'Manages the parish finances',
    },
    {
      value: 'media_manager',
      label: 'Media and Communications Manager',
      description: 'Responsible for internal and external communications',
    },
    {
      value: 'sickness_committee',
      label: 'Sickness Committee',
      description: 'Supports sick and elderly parishioners',
    },
    {
      value: 'sexton',
      label: 'Sexton',
      description:
        'Responsible for the preparation and care of the church and celebrations',
    },
    {
      value: 'other',
      label: 'Different and well....',
      description: undefined,
    },
  ];

  constructor(private formBuilder: FormBuilder) {
    this.volunteerForm = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: [
        '',
        [Validators.required, Validators.pattern(/^[\d\s\+\-\(\)]+$/)],
      ],
      message: ['', [Validators.required, Validators.minLength(10)]],
      volunteerFor: this.formBuilder.array([], [Validators.required]),
    });
  }

  public onCheckboxChange(event: Event, value: string): void {
    const checkbox = event.target as HTMLInputElement;
    const volunteerForArray = this.volunteerForm.get(
      'volunteerFor',
    ) as FormArray;

    if (checkbox.checked) {
      volunteerForArray.push(this.formBuilder.control(value));
    } else {
      const index = volunteerForArray.controls.findIndex(
        (control) => control.value === value,
      );
      if (index !== -1) {
        volunteerForArray.removeAt(index);
      }
    }

    // Mark as touched to trigger validation
    volunteerForArray.markAsTouched();
  }

  public async onSubmit(): Promise<void> {
    if (this.volunteerForm.invalid) {
      this.volunteerForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.submitSuccess = false;
    this.submitError = false;

    try {
      const formData: Volunteer = this.volunteerForm.value;
      const submissionId = await this.joinUsService.submitForm(
        'volunteer',
        formData,
      );

      console.log('Volunteer form submitted successfully:', submissionId);
      this.isSubmitting = false;
      this.submitSuccess = true;
      this.volunteerForm.reset();

      // Reset the FormArray properly
      const volunteerForArray = this.volunteerForm.get(
        'volunteerFor',
      ) as FormArray;
      volunteerForArray.clear();

      // Uncheck all checkboxes
      const checkboxes = document.querySelectorAll(
        'input[type="checkbox"]',
      ) as NodeListOf<HTMLInputElement>;
      checkboxes.forEach((checkbox) => {
        checkbox.checked = false;
      });

      // Hide success message after 5 seconds
      setTimeout(() => {
        this.submitSuccess = false;
      }, 5000);
    } catch (error) {
      console.error('Error submitting volunteer form:', error);
      this.isSubmitting = false;
      this.submitError = true;

      // Hide error message after 5 seconds
      setTimeout(() => {
        this.submitError = false;
      }, 5000);
    }
  }
}
