import { Component } from '@angular/core';
import { HeroPage } from '../../shared/components/hero-page/hero-page';
import { AnointingContentSection } from './sections/anointing-content-section/anointing-content-section';
import { AnointingFormSection } from './sections/anointing-form-section/anointing-form-section';
import { ContactUsSection } from '../home/sections/contact-us-section/contact-us-section';

const COMPONENTS = [
  HeroPage,
  AnointingContentSection,
  AnointingFormSection,
  ContactUsSection,
];

@Component({
  selector: 'app-anointing',
  imports: [...COMPONENTS],
  templateUrl: './anointing.html',
})
export class Anointing {}
