import { Component } from '@angular/core';
import { HeroPage } from '../../shared/components/hero-page/hero-page';
import { HolyCommunionContentSection } from './sections/holy-communion-content-section/holy-communion-content-section';
import { HolyCommunionFormSection } from './sections/holy-communion-form-section/holy-communion-form-section';
import { ContactUsSection } from '../home/sections/contact-us-section/contact-us-section';

const COMPONENTS = [
  HeroPage,
  HolyCommunionContentSection,
  HolyCommunionFormSection,
  ContactUsSection,
];

@Component({
  selector: 'app-holy-communion',
  imports: [...COMPONENTS],
  templateUrl: './holy-communion.html',
})
export class HolyCommunion {}
