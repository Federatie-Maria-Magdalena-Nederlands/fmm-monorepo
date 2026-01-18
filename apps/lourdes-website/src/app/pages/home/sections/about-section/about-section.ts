import { Component } from '@angular/core';
import { AbstractBackground } from '../../../../shared/components/abstract-background/abstract-background';

const COMPONENTS = [AbstractBackground];
@Component({
  selector: 'app-about-section',
  imports: [...COMPONENTS],
  templateUrl: './about-section.html',
})
export class AboutSection {}
