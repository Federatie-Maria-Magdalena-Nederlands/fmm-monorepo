import { Component } from '@angular/core';
import { HeroPage } from '../../shared/components/hero-page/hero-page';
import { ChurchMembershipContentSection } from './sections/church-membership-content-section/church-membership-content-section';
import { ChurchMembershipRegistrationSection } from './sections/church-membership-registration-section/church-membership-registration-section';
import { ContactUsSection } from '../home/sections/contact-us-section/contact-us-section';

const COMPONENTS = [
  HeroPage,
  ChurchMembershipContentSection,
  ChurchMembershipRegistrationSection,
  ContactUsSection,
];

@Component({
  selector: 'app-church-member',
  imports: [...COMPONENTS],
  templateUrl: './church-member.html',
})
export class ChurchMember {}
