import { Component } from '@angular/core';
import { HeroPage } from '../../shared/components/hero-page/hero-page';
import { DonationsContentSection } from './sections/donations-content-section/donations-content-section';
import { DonationsFormSection } from './sections/donations-form-section/donations-form-section';
import { ContactUsSection } from '../home/sections/contact-us-section/contact-us-section';

const COMPONENTS = [
  HeroPage,
  DonationsContentSection,
  DonationsFormSection,
  ContactUsSection,
];

@Component({
  selector: 'app-donations',
  imports: [...COMPONENTS],
  templateUrl: './donations.html',
})
export class Donations {}
