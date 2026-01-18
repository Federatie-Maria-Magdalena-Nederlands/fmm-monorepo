import { Component } from '@angular/core';
import { Timeline } from '../../../../shared/components/timeline/timeline';
import { AbstractBackground } from '../../../../shared/components/abstract-background/abstract-background';

const COMPONENTS = [Timeline, AbstractBackground];
@Component({
  selector: 'app-brief-history-section',
  imports: [...COMPONENTS],
  templateUrl: './brief-history-section.html',
})
export class BriefHistorySection {}
