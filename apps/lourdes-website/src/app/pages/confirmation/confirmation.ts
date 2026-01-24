import { Component } from '@angular/core';
import { HeroPage } from '../../shared/components/hero-page/hero-page';
import { ConfirmationContentSection } from './sections/confirmation-content-section/confirmation-content-section';
import { ConfirmationFormSection } from './sections/confirmation-form-section/confirmation-form-section';
import { ContactUsSection } from '../home/sections/contact-us-section/contact-us-section';

const COMPONENTS = [
  HeroPage,
  ConfirmationContentSection,
  ConfirmationFormSection,
  ContactUsSection,
];

@Component({
  selector: 'app-confirmation',
  imports: [...COMPONENTS],
  templateUrl: './confirmation.html',
})
export class Confirmation {}
