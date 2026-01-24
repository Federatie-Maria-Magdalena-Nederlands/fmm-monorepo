import { Component } from '@angular/core';
import { AbstractBackground } from '../../../../shared/components/abstract-background/abstract-background';
import { SparkIcon } from '../../../../shared/components/icons/spark-icon';

const COMPONENTS = [AbstractBackground, SparkIcon];

@Component({
  selector: 'app-church-membership-content-section',
  imports: [...COMPONENTS],
  templateUrl: './church-membership-content-section.html',
})
export class ChurchMembershipContentSection {}
