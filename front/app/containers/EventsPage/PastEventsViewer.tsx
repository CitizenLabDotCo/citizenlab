import React from 'react';
import styled from 'styled-components';
import EventsViewer from './EventsViewer';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

const StyledEventsViewer = styled(EventsViewer)`
  margin-top: 135px;
`;

interface Props {
  pastEvents: number[];
}

export default injectIntl<Props & InjectedIntlProps>(({ pastEvents, intl }) => (
  <StyledEventsViewer
    title={intl.formatMessage(messages.pastEvents)}
    fallbackMessage={intl.formatMessage(messages.noPastEvents)}
    events={pastEvents}
  />
));
