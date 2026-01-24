import { Component } from '@angular/core';
import { HeroPage } from '../../shared/components/hero-page/hero-page';
import { VolunteerContentSection } from './sections/volunteer-content-section/volunteer-content-section';
import { VolunteerRegistrationSection } from './sections/volunteer-registration-section/volunteer-registration-section';
import { ContactUsSection } from '../home/sections/contact-us-section/contact-us-section';

const COMPONENTS = [
  HeroPage,
  VolunteerContentSection,
  VolunteerRegistrationSection,
  ContactUsSection,
];

@Component({
  selector: 'app-volunteer',
  imports: [...COMPONENTS],
  templateUrl: './volunteer.html',
})
export class Volunteer {}
