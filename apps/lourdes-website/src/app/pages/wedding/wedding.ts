import { Component } from '@angular/core';
import { HeroPage } from '../../shared/components/hero-page/hero-page';
import { WeddingContentSection } from './sections/wedding-content-section/wedding-content-section';
import { WeddingFormSection } from './sections/wedding-form-section/wedding-form-section';
import { ContactUsSection } from '../home/sections/contact-us-section/contact-us-section';

const COMPONENTS = [
  HeroPage,
  WeddingContentSection,
  WeddingFormSection,
  ContactUsSection,
];

@Component({
  selector: 'app-wedding',
  imports: [...COMPONENTS],
  templateUrl: './wedding.html',
})
export class Wedding {}
