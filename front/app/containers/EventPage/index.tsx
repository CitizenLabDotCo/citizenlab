import React from 'react';

import messages from './messages';

// components
import ContentContainer from 'components/ContentContainer';
import SectionContainer from 'components/SectionContainer';
import { Helmet } from 'react-helmet';
import EventViewer from './EventViewer';
import { FormattedMessage } from 'utils/cl-intl';

// styling
import styled from 'styled-components';

const StyledContentContainer = styled(ContentContainer)`
  max-width: calc(${(props) => props.theme.maxPageWidth}px - 100px);
  margin-left: auto;
  margin-right: auto;
`;

const EventViewerWithTopMargin = styled(EventViewer)`
  margin-top: 78px;
`;

const EventPage = () => {
  const upcomingEvents = Array(15)
    .fill(0)
    .map((_, i) => i + 1);

  const pastEvents = [];

  return (
    <>
      <Helmet>
        <title>Events</title>
      </Helmet>

      <SectionContainer>
        <StyledContentContainer>
          <EventViewer
            title={<FormattedMessage {...messages.upcomingEvents} />}
            fallbackMessage={
              <FormattedMessage {...messages.noUpcomingEvents} />
            }
            events={upcomingEvents}
          />

          <EventViewerWithTopMargin
            title={<FormattedMessage {...messages.pastEvents} />}
            fallbackMessage={<FormattedMessage {...messages.noPastEvents} />}
            events={pastEvents}
          />
        </StyledContentContainer>
      </SectionContainer>
    </>
  );
};

export default EventPage;
