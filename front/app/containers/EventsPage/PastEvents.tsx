import React from 'react';
import EventsViewer from './EventsViewer';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { WrappedComponentProps } from 'react-intl';
import messages from './messages';

export default injectIntl<WrappedComponentProps>(({ intl }) => (
  <EventsViewer
    showProjectFilter={true}
    title={intl.formatMessage(messages.pastEvents)}
    fallbackMessage={messages.noPastEvents}
    eventsTime="past"
    onClickTitleGoToProjectAndScrollToEvent={true}
    projectPublicationStatuses={['published']}
  />
));
