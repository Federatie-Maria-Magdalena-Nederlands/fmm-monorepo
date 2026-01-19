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
  templateUrl: './about-soulfire.html',
})
export class AboutSoulfire {
  public images = [
    '/assets/images/soulfire1.webp',
    '/assets/images/soulfire2.webp',
    '/assets/images/soulfire3.webp',
    '/assets/images/soulfire4.webp',
    '/assets/images/soulfire5.webp',
    '/assets/images/soulfire6.webp',
    '/assets/images/soulfire7.webp',
    '/assets/images/soulfire8.webp',
  ];
}
