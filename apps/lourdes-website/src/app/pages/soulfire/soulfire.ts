import { Component } from '@angular/core';
import { HeroPage } from '../../shared/components/hero-page/hero-page';
import { AboutSoulfireSection } from './sections/about-soulfire-section/about-soulfire-section';
import { JoinCommunitySection } from '../home/sections/join-community-section/join-community-section';
import { PhotosSection } from './sections/photos-section/photos-section';

const COMPONENTS = [
  HeroPage,
  AboutSoulfireSection,
  JoinCommunitySection,
  PhotosSection,
];

@Component({
  selector: 'app-soulfire',
  imports: [...COMPONENTS],
  templateUrl: './soulfire.html',
})
export class Soulfire {}
