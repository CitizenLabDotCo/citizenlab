import React from 'react';
import { WrappedComponentProps } from 'react-intl';
// i18n
import { injectIntl } from 'utils/cl-intl';
import EventsViewer from './EventsViewer';
import messages from './messages';

export default injectIntl<WrappedComponentProps>(({ intl }) => (
  <EventsViewer
    showProjectFilter={true}
    title={intl.formatMessage(messages.pastEvents)}
    fallbackMessage={messages.noPastEvents}
    eventsTime="past"
    onClickTitleGoToProjectAndScrollToEvent={true}
  />
));
