import { Component } from '@angular/core';
import { HeroPage } from '../../shared/components/hero-page/hero-page';
import { LiveStreamingSection } from './sections/live-streaming-section/live-streaming-section';
import { ContactUsSection } from '../home/sections/contact-us-section/contact-us-section';

const COMPONENTS = [HeroPage, LiveStreamingSection, ContactUsSection];

@Component({
  selector: 'app-live-streaming',
  imports: [...COMPONENTS],
  templateUrl: './live-streaming.html',
})
export class LiveStreaming {}
