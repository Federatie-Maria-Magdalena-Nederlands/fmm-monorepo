import { Component } from '@angular/core';
import { HeroPage } from '../../shared/components/hero-page/hero-page';
import { BaptismContentSection } from './sections/baptism-content-section/baptism-content-section';
import { BaptismFormSection } from './sections/baptism-form-section/baptism-form-section';
import { ContactUsSection } from '../home/sections/contact-us-section/contact-us-section';

const COMPONENTS = [
  HeroPage,
  BaptismContentSection,
  BaptismFormSection,
  ContactUsSection,
];

@Component({
  selector: 'app-baptism',
  imports: [...COMPONENTS],
  templateUrl: './baptism.html',
})
export class Baptism {}
