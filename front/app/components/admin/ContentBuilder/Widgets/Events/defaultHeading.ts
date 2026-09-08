import landingPageMessages from 'components/LandingPages/citizen/messages';
import projectPageMessages from 'components/ProjectPageBuilder/Widgets/messages';

import { MessageDescriptor } from 'utils/cl-intl';
import sharedMessages from 'utils/messages';

import { EventsSource, EventsTimeFilter } from './types';

// The settings panel shows this as the heading placeholder, so it has to be the message the
// widget actually falls back to.
//
// With both buckets on, each section carries its own subheading, so the heading names the
// widget rather than a bucket — otherwise it repeats the upcoming subheading word for word.
const defaultHeadingMessage = (
  source: EventsSource,
  timeFilters: EventsTimeFilter[]
): MessageDescriptor => {
  if (source === 'currentProject') return projectPageMessages.eventsWidgetTitle;
  if (timeFilters.includes('upcoming') && timeFilters.includes('past')) {
    return projectPageMessages.eventsWidgetTitle;
  }
  if (timeFilters.includes('past')) return sharedMessages.pastEvents;

  return landingPageMessages.upcomingEventsWidgetTitle;
};

export default defaultHeadingMessage;
