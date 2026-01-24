import { Component } from '@angular/core';
import { HeroPage } from '../../shared/components/hero-page/hero-page';
import { ConsecrationContentSection } from './sections/consecration-content-section/consecration-content-section';
import { ConsecrationFormSection } from './sections/consecration-form-section/consecration-form-section';
import { ContactUsSection } from '../home/sections/contact-us-section/contact-us-section';

const COMPONENTS = [
  HeroPage,
  ConsecrationContentSection,
  ConsecrationFormSection,
  ContactUsSection,
];

@Component({
  selector: 'app-consecration',
  imports: [...COMPONENTS],
  templateUrl: './consecration.html',
})
export class Consecration {}
