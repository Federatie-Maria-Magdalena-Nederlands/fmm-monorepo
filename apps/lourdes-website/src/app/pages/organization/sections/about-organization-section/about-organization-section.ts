import { Component } from '@angular/core';
import { AbstractBackground } from '../../../../shared/components/abstract-background/abstract-background';

const COMPONENTS = [AbstractBackground];

@Component({
  selector: 'app-about-organization-section',
  imports: [...COMPONENTS],
  templateUrl: './about-organization-section.html',
})
export class AboutOrganizationSection {}
