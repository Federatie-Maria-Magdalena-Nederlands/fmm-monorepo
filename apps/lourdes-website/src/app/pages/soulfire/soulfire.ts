import { Component } from '@angular/core';
import { HeroPage } from '../../shared/components/hero-page/hero-page';
import { AboutSoulfire } from './sections/about-soulfire/about-soulfire';
import { JoinCommunitySection } from '../home/sections/join-community-section/join-community-section';

const COMPONENTS = [HeroPage, AboutSoulfire, JoinCommunitySection];

@Component({
  selector: 'app-soulfire',
  imports: [...COMPONENTS],
  templateUrl: './soulfire.html',
})
export class Soulfire {}
