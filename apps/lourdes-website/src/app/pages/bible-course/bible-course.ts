import { Component } from '@angular/core';
import { HeroPage } from '../../shared/components/hero-page/hero-page';
import { BibleCourseContentSection } from './sections/bible-course-content-section/bible-course-content-section';
import { BibleCourseRegistrationSection } from './sections/bible-course-registration-section/bible-course-registration-section';
import { JoinCommunitySection } from '../home/sections/join-community-section/join-community-section';
import { ImagesMarqueeSection } from '../home/sections/images-marquee-section/images-marquee-section';

const COMPONENTS = [
  HeroPage,
  BibleCourseContentSection,
  BibleCourseRegistrationSection,
];

@Component({
  selector: 'app-bible-course',
  imports: [...COMPONENTS, JoinCommunitySection, ImagesMarqueeSection],
  templateUrl: './bible-course.html',
})
export class BibleCourse {}
