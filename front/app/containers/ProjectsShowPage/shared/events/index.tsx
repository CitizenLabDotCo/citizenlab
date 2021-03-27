import React, { memo } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { sortBy } from 'lodash-es';

// hooks
import useProject from 'hooks/useProject';
import useEvents from 'hooks/useEvents';

// components
import EventCard from './EventCard';
import ContentContainer from 'components/ContentContainer';
import {
  SectionContainer,
  ProjectPageSectionTitle,
  maxPageWidth,
} from 'containers/ProjectsShowPage/styles';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from 'containers/ProjectsShowPage/messages';

// style
import styled from 'styled-components';

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
  const events = useEvents(projectId);

  if (!isNilOrError(project) && !isNilOrError(events) && events.length > 0) {
    const sortedEvents = sortBy(events, [(event) => event.attributes.start_at]);

    return (
      <Container id="project-events" className={className || ''}>
        <ContentContainer maxWidth={maxPageWidth}>
          <SectionContainer>
            <ProjectPageSectionTitle>
              <FormattedMessage {...messages.events} />
            </ProjectPageSectionTitle>
            {sortedEvents.map((event) => (
              <StyledEventCard key={event.id} event={event} />
            ))}
          </SectionContainer>
        </ContentContainer>
      </Container>
    );
  }

  return null;
});

export default EventsContainer;
