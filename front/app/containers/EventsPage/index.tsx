import React from 'react';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

// components
import ContentContainer from 'components/ContentContainer';
import SectionContainer from 'components/SectionContainer';
import { Helmet } from 'react-helmet';
import UpcomingEventsViewer from './UpcomingEventsViewer';
import PastEventsViewer from './PastEventsViewer';

// styling
import styled from 'styled-components';

const StyledContentContainer = styled(ContentContainer)`
  max-width: calc(${(props) => props.theme.maxPageWidth}px - 100px);
  margin-left: auto;
  margin-right: auto;
`;

export default injectIntl<InjectedIntlProps>(({ intl }) => {
  const upcomingEvents = Array(15)
    .fill(0)
    .map((_, i) => i + 1);

  const pastEvents = [];

  return (
    <>
      <Helmet>
        <title>{intl.formatMessage(messages.eventPageTitle)}</title>
      </Helmet>

      <SectionContainer>
        <StyledContentContainer>
          <UpcomingEventsViewer upcomingEvents={upcomingEvents} />
          <PastEventsViewer pastEvents={pastEvents} />
        </StyledContentContainer>
      </SectionContainer>
    </>
  );
});
