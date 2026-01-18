import { Component } from '@angular/core';
import { BriefHistorySection } from '../home/sections/brief-history-section/brief-history-section';
import { AboutSection } from '../home/sections/about-section/about-section';
import { JoinCommunitySection } from '../home/sections/join-community-section/join-community-section';
import { HeroPage } from '../../shared/components/hero-page/hero-page';

const SECTIONS = [
  BriefHistorySection,
  AboutSection,
  JoinCommunitySection,
  HeroPage,
];

@Component({
  selector: 'app-history',
  imports: [...SECTIONS],
  templateUrl: './history.html',
})
export class History {}
