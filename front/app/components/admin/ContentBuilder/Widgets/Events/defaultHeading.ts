import landingPageMessages from 'components/LandingPages/citizen/messages';
import projectPageMessages from 'components/ProjectPageBuilder/Widgets/messages';

import { MessageDescriptor } from 'utils/cl-intl';

import { EventsSource } from './types';

// The settings panel shows this as the heading placeholder, so it has to be the message the
// widget actually falls back to.
const defaultHeadingMessage = (source: EventsSource): MessageDescriptor =>
  source === 'currentProject'
    ? projectPageMessages.eventsWidgetTitle
    : landingPageMessages.upcomingEventsWidgetTitle;

export default defaultHeadingMessage;
