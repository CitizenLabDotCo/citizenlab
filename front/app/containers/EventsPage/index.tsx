import React from 'react';

// components
import EventsPageMeta from './EventsPageMeta';
import SectionContainer from 'components/SectionContainer';
import ContentContainer from 'components/ContentContainer';
import UpcomingEvents from './UpcomingEvents';
import PastEvents from './PastEvents';

// hooks
import useFeatureFlag from 'hooks/useFeatureFlag';
import useLocale from 'hooks/useLocale';

// styling
import styled from 'styled-components';

// other
import { isNilOrError } from 'utils/helperUtils';
import redirectToNotFoundPage from 'utils/cl-router/redirectToNotFoundPage';

const StyledContentContainer = styled(ContentContainer)`
  max-width: calc(${(props) => props.theme.maxPageWidth}px - 100px);
  margin-left: auto;
  margin-right: auto;
`;

export default () => {
  const eventsPageEnabled = useFeatureFlag('events_page');
  const locale = useLocale();

  if (isNilOrError(locale)) return null;
  if (!eventsPageEnabled) return redirectToNotFoundPage(locale, 'events');

  return (
    <>
      <EventsPageMeta />

      <SectionContainer>
        <StyledContentContainer>
          <UpcomingEvents />
          <PastEvents />
        </StyledContentContainer>
      </SectionContainer>
    </>
  );
};
