import React from 'react';
import EventsViewer from './EventsViewer';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

interface Props {
  upcomingEvents: number[];
}

export default injectIntl<Props & InjectedIntlProps>(
  ({ upcomingEvents, intl }) => (
    <EventsViewer
      title={intl.formatMessage(messages.upcomingEvents)}
      fallbackMessage={intl.formatMessage(messages.noUpcomingEvents)}
      events={upcomingEvents}
    />
  )
);
