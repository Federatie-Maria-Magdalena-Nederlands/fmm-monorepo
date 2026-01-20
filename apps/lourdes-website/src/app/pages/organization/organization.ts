import { Component } from '@angular/core';
import { HeroPage } from '../../shared/components/hero-page/hero-page';
import { AboutOrganizationSection } from './sections/about-organization-section/about-organization-section';
import { JoinCommunitySection } from '../home/sections/join-community-section/join-community-section';
import { ImagesMarqueeSection } from '../home/sections/images-marquee-section/images-marquee-section';
import { ContactUsSection } from '../home/sections/contact-us-section/contact-us-section';

const COMPONENTS = [
  HeroPage,
  AboutOrganizationSection,
  JoinCommunitySection,
  ImagesMarqueeSection,
  ContactUsSection,
];

@Component({
  selector: 'app-organization',
  imports: [...COMPONENTS, ImagesMarqueeSection, ContactUsSection],
  templateUrl: './organization.html',
})
export class Organization {}
