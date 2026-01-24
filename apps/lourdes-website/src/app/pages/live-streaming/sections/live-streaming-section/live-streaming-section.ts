import { Component } from '@angular/core';
import { AbstractBackground } from '../../../../shared/components/abstract-background/abstract-background';
import { SparkIcon } from '../../../../shared/components/icons/spark-icon';

const COMPONENTS = [AbstractBackground, SparkIcon];

interface StreamingEvent {
  title: string;
  description: string;
  date: string;
  url: string;
  isLive?: boolean;
}

@Component({
  selector: 'app-live-streaming-section',
  imports: [...COMPONENTS],
  templateUrl: './live-streaming-section.html',
})
export class LiveStreamingSection {
  public youtubeChannelUrl = 'https://www.youtube.com/@LourdesParish';

  public streamingEvents: StreamingEvent[] = [
    {
      title: 'Sunday Holy Mass',
      description:
        'Join us for our weekly celebration of the Eucharist. Experience the beauty of worship and community from the comfort of your home.',
      date: 'Every Sunday at 10:00 AM',
      url: 'https://www.youtube.com/@LourdesParish/live',
      isLive: false,
    },
    {
      title: 'Evening Prayer Service',
      description:
        'End your day with peaceful prayer and reflection. A beautiful service of evening prayer and meditation.',
      date: 'Wednesdays at 7:00 PM',
      url: 'https://www.youtube.com/@LourdesParish/streams',
      isLive: false,
    },
    {
      title: 'Special Feast Day Celebration',
      description:
        'Join us for special celebrations of important feast days and holy days throughout the liturgical year.',
      date: 'Varies by Calendar',
      url: 'https://www.youtube.com/@LourdesParish/streams',
      isLive: false,
    },
    {
      title: 'Christmas Eve Mass',
      description:
        'Celebrate the birth of our Savior with this special midnight Mass on Christmas Eve.',
      date: 'December 24, 2026 at 11:00 PM',
      url: 'https://www.youtube.com/@LourdesParish/streams',
      isLive: false,
    },
    {
      title: 'Easter Sunday Service',
      description:
        'Rejoice in the resurrection with our joyful Easter Sunday celebration and worship service.',
      date: 'April 18, 2026 at 10:00 AM',
      url: 'https://www.youtube.com/@LourdesParish/streams',
      isLive: false,
    },
    {
      title: 'Pentecost Celebration',
      description:
        'Celebrate the coming of the Holy Spirit with special prayers, hymns, and worship.',
      date: 'May 31, 2026 at 10:00 AM',
      url: 'https://www.youtube.com/@LourdesParish/streams',
      isLive: false,
    },
  ];
}
