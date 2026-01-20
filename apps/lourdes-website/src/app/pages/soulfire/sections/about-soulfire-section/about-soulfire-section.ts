import { Component } from '@angular/core';
import { AbstractBackground } from '../../../../shared/components/abstract-background/abstract-background';
import { LocationIcon } from '../../../../shared/components/icons/location-icon';
import { ClickIcon } from '../../../../shared/components/icons/click-icon';
import { FireIcon } from '../../../../shared/components/icons/fire-icon';
import { SparkIcon } from '../../../../shared/components/icons/spark-icon';

const COMPONENTS = [
  AbstractBackground,
  LocationIcon,
  SparkIcon,
  ClickIcon,
  FireIcon,
];
@Component({
  selector: 'app-about-soulfire',
  imports: [...COMPONENTS],
  templateUrl: './about-soulfire-section.html',
})
export class AboutSoulfireSection {}
