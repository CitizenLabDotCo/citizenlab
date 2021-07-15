import React, { memo, useEffect } from 'react';
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
import { getScrollToEventId, setScrollToEventId } from './scrollToEventState';

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

  useEffect(() => {
    const scrollToEventId = getScrollToEventId();

    if (!isNilOrError(events) && scrollToEventId !== null) {
      setTimeout(() => {
        const element = document.getElementById(scrollToEventId);

        if (element) {
          const top =
            element.getBoundingClientRect().top + window.pageYOffset - 100;
          const behavior = 'smooth';
          window.scrollTo({ top, behavior });
        }
      }, 100);

      setScrollToEventId(null);
    }
  }, [events]);

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
