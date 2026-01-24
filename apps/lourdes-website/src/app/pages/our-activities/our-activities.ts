import { Component } from '@angular/core';
import { HeroPage } from '../../shared/components/hero-page/hero-page';
import { ActivitiesSection } from './sections/activities-section/activities-section';
import { JoinCommunitySection } from '../home/sections/join-community-section/join-community-section';
import { ContactUsSection } from '../home/sections/contact-us-section/contact-us-section';

const COMPONENTS = [
  HeroPage,
  ActivitiesSection,
  JoinCommunitySection,
  ContactUsSection,
];

@Component({
  selector: 'app-our-activities',
  imports: [...COMPONENTS],
  templateUrl: './our-activities.html',
})
export class OurActivities {}
