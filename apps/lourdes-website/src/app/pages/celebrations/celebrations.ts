import { Component } from '@angular/core';
import { HeroPage } from '../../shared/components/hero-page/hero-page';
import { CelebrationsSection } from './sections/celebrations-section/celebrations-section';
import { JoinCommunitySection } from '../home/sections/join-community-section/join-community-section';
import { ContactUsSection } from '../home/sections/contact-us-section/contact-us-section';

const COMPONENTS = [
  HeroPage,
  CelebrationsSection,
  JoinCommunitySection,
  ContactUsSection,
];

@Component({
  selector: 'app-celebrations',
  imports: [...COMPONENTS],
  templateUrl: './celebrations.html',
})
export class Celebrations {}
