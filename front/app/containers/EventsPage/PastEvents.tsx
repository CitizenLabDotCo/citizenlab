import React from 'react';
import EventsViewer from './EventsViewer';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

export default injectIntl<InjectedIntlProps>(({ intl }) => (
  <EventsViewer
    title={intl.formatMessage(messages.pastEvents)}
    fallbackMessage={intl.formatMessage(messages.noPastEvents)}
    eventsTime="past"
  />
));
