import landingPageMessages from 'components/LandingPages/citizen/messages';
import projectPageMessages from 'components/ProjectPageBuilder/Widgets/messages';

import sharedMessages from 'utils/messages';

import defaultHeading from './defaultHeading';

describe('defaultHeading', () => {
  // With both buckets on, each section carries its own subheading, so a bucket-named heading
  // would repeat the one below it word for word.
  it('names the widget when both buckets are shown', () => {
    expect(defaultHeading(['upcoming', 'past'])).toBe(
      projectPageMessages.eventsWidgetTitle
    );
  });

  it('names the bucket when only one is shown', () => {
    expect(defaultHeading(['past'])).toBe(sharedMessages.pastEvents);
    expect(defaultHeading(['upcoming'])).toBe(
      landingPageMessages.upcomingEventsWidgetTitle
    );
  });
});
