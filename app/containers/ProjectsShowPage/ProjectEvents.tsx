import React, { memo } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// hooks
import useProject from 'hooks/useProject';
import useEvents from 'hooks/useEvents';

// components
import ProjectEvent from './ProjectEvent';
import ContentContainer from 'components/ContentContainer';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// utils
import { pastPresentOrFuture } from 'utils/dateUtils';

// style
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

const Container = styled.div``;

const Title = styled.h2`
  color: ${colors.text};
  font-size: ${fontSizes.xxl}px;
  line-height: normal;
  font-weight: 600;
  padding: 0;
  margin: 0;
  margin-bottom: 20px;
`;

interface Props {
  projectId: string;
  className?: string;
}

const ProjectEvents = memo<Props>(({ projectId, className }) => {
  const project = useProject({ projectId });
  const events = useEvents(projectId);

  if (!isNilOrError(project) && !isNilOrError(events)) {
    const upcomingEvents = events
      ? events.filter((event) => {
          const eventTime = pastPresentOrFuture([
            event.attributes.start_at,
            event.attributes.end_at,
          ]);
          return eventTime === 'present' || eventTime === 'future';
        })
      : null;

    if (upcomingEvents && upcomingEvents.length > 0) {
      return (
        <Container id="project-events" className={className || ''}>
          <ContentContainer>
            <Title>
              <FormattedMessage {...messages.upcomingEvents} />
            </Title>
            {upcomingEvents.map((event) => (
              <ProjectEvent key={event.id} event={event} />
            ))}
          </ContentContainer>
        </Container>
      );
    }
  }

  return null;
});

export default ProjectEvents;
