import { Component } from '@angular/core';
import { AbstractBackground } from '../../../../shared/components/abstract-background/abstract-background';
import { SparkIcon } from '../../../../shared/components/icons/spark-icon';

const COMPONENTS = [AbstractBackground, SparkIcon];

@Component({
  selector: 'app-activities-section',
  imports: [...COMPONENTS],
  templateUrl: './activities-section.html',
})
export class ActivitiesSection {
  public activities: Activity[] = [
    {
      title: 'Sunday Mass',
      description:
        'Join us for our weekly celebration of the Eucharist. Experience the beauty of worship and community as we gather to praise and give thanks.',
      image: 'assets/images/mass.jpg',
      schedule: 'Every Sunday at 10:00 AM',
    },
    {
      title: 'Bible Study',
      description:
        'Deepen your understanding of Scripture through guided study and group discussions. All ages and experience levels welcome.',
      image: 'assets/images/bible-study.jpg',
      schedule: 'Wednesdays at 7:00 PM',
    },
    {
      title: 'Youth Group',
      description:
        'A vibrant community for young people to grow in faith, build friendships, and serve others through various activities and events.',
      image: 'assets/images/youth-group.jpg',
      schedule: 'Fridays at 6:00 PM',
    },
    {
      title: 'Community Outreach',
      description:
        'Serve those in need through our various outreach programs. Make a difference in the lives of others while living out our faith.',
      image: 'assets/images/outreach.jpg',
      schedule: 'Monthly Events',
    },
    {
      title: 'Prayer Groups',
      description:
        'Join fellow parishioners in communal prayer and reflection. Experience the power of praying together as a community.',
      image: 'assets/images/prayer.jpg',
      schedule: 'Tuesdays & Thursdays',
    },
    {
      title: 'Choir Practice',
      description:
        'Lift your voice in praise! Join our parish choir and help lead worship through beautiful music and song.',
      image: 'assets/images/choir.jpg',
      schedule: 'Thursdays at 7:30 PM',
    },
  ];
}
