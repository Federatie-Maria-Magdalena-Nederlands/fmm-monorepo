import { Component } from '@angular/core';
import { HeroPage } from '../../shared/components/hero-page/hero-page';
import { AboutMagazineSection } from './sections/about-magazine-section/about-magazine-section';
import { JoinCommunitySection } from '../home/sections/join-community-section/join-community-section';
import { ContactUsSection } from '../home/sections/contact-us-section/contact-us-section';

const COMPONENTS = [
  HeroPage,
  AboutMagazineSection,
  JoinCommunitySection,
  ContactUsSection,
];

@Component({
  selector: 'app-magazine',
  imports: [...COMPONENTS, ContactUsSection],
  templateUrl: './magazine.html',
})
export class Magazine {}
