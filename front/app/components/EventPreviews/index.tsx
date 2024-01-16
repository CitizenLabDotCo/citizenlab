import React, { useRef } from 'react';

// components
import { Box, Title } from '@citizenlab/cl2-component-library';
import EventPreviewCard from './EventPreviewCard';

// api
import useEvents from 'api/events/useEvents';
import usePhases from 'api/phases/usePhases';
import { getCurrentPhase } from 'api/phases/utils';
import useProjectBySlug from 'api/projects/useProjectBySlug';

// style
import styled from 'styled-components';

// intl
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

// router
import { useParams } from 'react-router-dom';

// util
import moment from 'moment';
import HorizontalScroll from 'components/HorizontalScroll';

type EventPreviewsProps = {
  projectId?: string;
};

const EventPreviewContainer = styled(Box)`
  ::-webkit-scrollbar {
    display: none;
  }
  scroll-behavior: smooth;
  -ms-overflow-style: none !important;
  scrollbar-width: none !important;
`;

const EventPreviews = ({ projectId }: EventPreviewsProps) => {
  const { formatMessage } = useIntl();
  const ref = useRef<HTMLDivElement>(null);

  // project related
  const params = useParams<{ slug: string }>();
  const { data: project } = useProjectBySlug(params.slug);
  const projectIdToUse = projectId || project?.data.id;
  const { data: phases } = usePhases(projectIdToUse);
  const { data: events } = useEvents({
    projectIds: projectIdToUse ? [projectIdToUse] : undefined,
    currentAndFutureOnly: true,
    sort: '-start_at',
    ongoing_during: [
      moment(getCurrentPhase(phases?.data)?.attributes.start_at).toString() ||
        null,
      moment(getCurrentPhase(phases?.data)?.attributes.end_at)
        .add(1, 'day')
        .toString() || null,
    ],
  });

  if (events && events?.data?.length > 0) {
    return (
      <>
        <Title
          color="tenantText"
          mt="36px"
          mb="8px"
          variant="h5"
          style={{ fontWeight: 600 }}
        >
          {formatMessage(messages.eventPreviewTimelineTitle)}
        </Title>
        <HorizontalScroll containerRef={ref}>
          <EventPreviewContainer
            py="8px"
            display="flex"
            gap="16px"
            width="100%"
            height="auto"
            flexDirection="row"
            flexWrap="nowrap"
            overflow="auto"
            overflowX="scroll"
            id="e2e-event-previews"
            ref={ref}
          >
            {events.data.map((event) => (
              <EventPreviewCard key={event.id} event={event} />
            ))}
          </EventPreviewContainer>
        </HorizontalScroll>
      </>
    );
  }
  return null;
};

export default EventPreviews;
