import { Component } from '@angular/core';
import { HeroPage } from '../../shared/components/hero-page/hero-page';
import { MassIntentionsContentSection } from './sections/mass-intentions-content-section/mass-intentions-content-section';
import { MassIntentionsFormSection } from './sections/mass-intentions-form-section/mass-intentions-form-section';
import { ContactUsSection } from '../home/sections/contact-us-section/contact-us-section';

const COMPONENTS = [
  HeroPage,
  MassIntentionsContentSection,
  MassIntentionsFormSection,
  ContactUsSection,
];

@Component({
  selector: 'app-mass-intentions',
  imports: [...COMPONENTS],
  templateUrl: './mass-intentions.html',
})
export class MassIntentions {}
