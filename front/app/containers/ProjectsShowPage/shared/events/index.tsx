import React, { memo, useEffect, useState } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// hooks
import useProject from 'hooks/useProject';
import useEvents from 'hooks/useEvents';

// components
import EventCard from 'components/EventCard';
import ContentContainer from 'components/ContentContainer';
import {
  ProjectPageSectionTitle,
  maxPageWidth,
} from 'containers/ProjectsShowPage/styles';
import SectionContainer from 'components/SectionContainer';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from 'containers/ProjectsShowPage/messages';

// style
import styled from 'styled-components';

// events
import { ScrollToEventCardParams } from 'components/EventCard';
import eventEmitter from 'utils/eventEmitter';

const Container = styled.div`
  background: #fff;
`;

const StyledEventCard = styled(EventCard)`
  margin-bottom: 30px;
`;

interface Props {
  projectId: string;
  className?: string;
}

const EventsContainer = memo<Props>(({ projectId, className }) => {
  const project = useProject({ projectId });
  const { events } = useEvents({ projectIds: [projectId] });
  const [scrollTo, setScrollTo] = useState<string | null>(null);

  useEffect(() => {
    const subscription = eventEmitter
      .observeEvent<ScrollToEventCardParams>('scrollToEventCardParams')
      .subscribe(({ eventValue: { eventId } }) => {
        if (scrollTo !== eventId) {
          setScrollTo(eventId);
        }
      });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (events && scrollTo !== null) {
      const element = document.getElementById(scrollTo);
      element?.scrollIntoView();
      setScrollTo(null);
    }
  }, [scrollTo, events]);

  if (!isNilOrError(project) && !isNilOrError(events) && events.length > 0) {
    return (
      <Container id="project-events" className={className || ''}>
        <ContentContainer maxWidth={maxPageWidth}>
          <SectionContainer>
            <ProjectPageSectionTitle>
              <FormattedMessage {...messages.events} />
            </ProjectPageSectionTitle>
            {events.map((event) => (
              <StyledEventCard
                id={event.id}
                key={event.id}
                event={event}
                showLocation
                showDescription
              />
            ))}
          </SectionContainer>
        </ContentContainer>
      </Container>
    );
  }

  return null;
});

export default EventsContainer;
