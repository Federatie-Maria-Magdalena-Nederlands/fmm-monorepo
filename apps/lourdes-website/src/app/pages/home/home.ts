import { Component } from '@angular/core';
import { Hero } from '../../shared/components/hero/hero';
import { AboutSection } from './sections/about-section/about-section';
import { BriefHistorySection } from './sections/brief-history-section/brief-history-section';
import { ContactUsSection } from './sections/contact-us-section/contact-us-section';
import { ImagesMarqueeSection } from './sections/images-marquee-section/images-marquee-section';
import { JoinCommunitySection } from './sections/join-community-section/join-community-section';
import { UpcomingCelebrationsSection } from './sections/upcoming-celebrations-section/upcoming-celebrations-section';

const COMPONENTS = [Hero];
const SECTIONS = [
  AboutSection,
  BriefHistorySection,
  ContactUsSection,
  ImagesMarqueeSection,
  JoinCommunitySection,
  UpcomingCelebrationsSection,
];

@Component({
  selector: 'app-home',
  imports: [...COMPONENTS, ...SECTIONS],
  templateUrl: './home.html',
})
export class Home {}
