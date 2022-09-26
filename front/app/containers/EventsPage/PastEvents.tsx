import React from 'react';
import EventsViewer from './EventsViewer';

// i18n
import { injectIntl } from 'react-intl';
import messages from './messages';

export default injectIntl(({ intl }) => (
  <EventsViewer
    title={intl.formatMessage(messages.pastEvents)}
    fallbackMessage={messages.noPastEvents}
    eventsTime="past"
  />
));
