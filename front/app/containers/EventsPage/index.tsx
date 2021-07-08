import React from 'react';

// components
import EventsPageMeta from './EventsPageMeta';
import SectionContainer from 'components/SectionContainer';
import ContentContainer from 'components/ContentContainer';
import UpcomingEvents from './UpcomingEvents';
import PastEvents from './PastEvents';

// hooks
import useSettingEnabled from 'hooks/useSettingEnabled';
import useLocale from 'hooks/useLocale';

// styling
import styled from 'styled-components';

// other
import clHistory from 'utils/cl-router/history';
import { isNilOrError } from 'utils/helperUtils';

const StyledContentContainer = styled(ContentContainer)`
  max-width: calc(${(props) => props.theme.maxPageWidth}px - 100px);
  margin-left: auto;
  margin-right: auto;
`;

export default () => {
  const eventsPageEnabled = useSettingEnabled('events_page');
  const locale = useLocale();

  if (eventsPageEnabled === 'pending' || isNilOrError(locale)) return null;

  if (eventsPageEnabled === 'disabled') {
    clHistory.replace(`/${locale}/*`);
    window.history.replaceState(null, '', `/${locale}/events`);
    return null;
  }

  const upcomingEvents = Array(15)
    .fill(0)
    .map((_, i) => i + 1);

  const pastEvents = [];

  return (
    <>
      <EventsPageMeta />

      <SectionContainer>
        <StyledContentContainer>
          <UpcomingEvents upcomingEvents={upcomingEvents} />
          <PastEvents pastEvents={pastEvents} />
        </StyledContentContainer>
      </SectionContainer>
    </>
  );
};
