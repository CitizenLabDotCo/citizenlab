import React from 'react';
import EventsViewer from './EventsViewer';
import styled from 'styled-components';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

const StyledEventsViewer = styled(EventsViewer)`
  margin-bottom: 135px;
`;

export default injectIntl<InjectedIntlProps>(({ intl }) => (
  <StyledEventsViewer
    title={intl.formatMessage(messages.upcomingEvents)}
    fallbackMessage={intl.formatMessage(messages.noUpcomingEvents)}
    eventsTime="future"
  />
));
