import { Component } from '@angular/core';
import { AbstractBackground } from '../../../../shared/components/abstract-background/abstract-background';
import { SparkIcon } from '../../../../shared/components/icons/spark-icon';

const COMPONENTS = [AbstractBackground, SparkIcon];

@Component({
  selector: 'app-volunteer-content-section',
  imports: [...COMPONENTS],
  templateUrl: './volunteer-content-section.html',
})
export class VolunteerContentSection {}
