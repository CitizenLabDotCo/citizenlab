import React, { useEffect, useRef, useState } from 'react';

// components
import {
  Box,
  Button,
  Title,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';
import EventPreviewCard from './EventPreviewCard';

// api
import useEvents from 'api/events/useEvents';
import usePhases from 'api/phases/usePhases';
import { getCurrentPhase } from 'api/phases/utils';

// style
import styled, { useTheme } from 'styled-components';

// intl
import { useIntl } from 'utils/cl-intl';
import messages from './messages';
import { useParams } from 'react-router-dom';
import useProjectBySlug from 'api/projects/useProjectBySlug';

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
  const theme = useTheme();
  const isSmallerThanPhone = useBreakpoint('phone');
  const ref = useRef<HTMLDivElement>(null);

  // project related
  const params = useParams<{ slug: string }>();
  const { data: project } = useProjectBySlug(params.slug);
  const projectIdToUse = projectId || project?.data.id;
  const { data: phases } = usePhases(projectIdToUse);
  const { data: events } = useEvents({
    projectIds: projectIdToUse ? [projectIdToUse] : undefined,
    sort: '-start_at',
  });

  // scrolling
  const [atScrollStart, setAtScrollStart] = useState(true);
  const [atScrollEnd, setAtScrollEnd] = useState(false);
  const [showArrowButtons, setShowArrowButtons] = useState(false);

  // initial lateral scroll arrow state
  useEffect(() => {
    if (ref?.current) {
      setShowArrowButtons(ref.current.scrollWidth > ref.current.clientWidth);
    }
  }, []);

  const projectType = project?.data.attributes.process_type;
  const currentPhase = getCurrentPhase(phases?.data);

  const lateralScroll = (scrollOffset: number) => {
    if (!ref?.current) return;
    ref.current.scrollLeft += scrollOffset;
  };

  const onScroll = () => {
    // Update scroll states
    if (!ref?.current) return;
    setAtScrollStart(ref.current.scrollLeft === 0);
    const maxScrollLeft = ref.current.scrollWidth - ref.current.clientWidth;
    setAtScrollEnd(ref.current.scrollLeft >= maxScrollLeft);
  };

  if (events && events?.data?.length > 0) {
    return (
      <>
        <Title mt="36px" mb="8px" variant="h5" style={{ fontWeight: 600 }}>
          {projectType === 'continuous' // TODO: Only show title if there are events to show. Need to wait for BE updates to events endpoint.
            ? formatMessage(messages.eventPreviewContinuousTitle)
            : formatMessage(messages.eventPreviewTimelineTitle)}
          :
        </Title>
        <Box display="flex" flexDirection={theme.isRtl ? 'row-reverse' : 'row'}>
          <Box
            aria-hidden="true"
            my="auto"
            display={showArrowButtons ? 'inherit' : 'none'}
          >
            <Button
              disabled={atScrollStart}
              onClick={() => {
                lateralScroll(isSmallerThanPhone ? -200 : -350);
              }}
              icon={theme.isRtl ? 'chevron-right' : 'chevron-left'}
              buttonStyle="text"
              p="0px"
              my="auto"
            />
          </Box>

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
            id="eventPreviewContainer"
            onScroll={onScroll}
            ref={ref}
          >
            {events.data.map((event) => (
              <EventPreviewCard
                key={event.id}
                event={event}
                currentPhase={currentPhase}
                projectType={projectType}
              />
            ))}
          </EventPreviewContainer>
          <Box
            aria-hidden="true"
            my="auto"
            display={showArrowButtons ? 'inherit' : 'none'}
          >
            <Button
              disabled={atScrollEnd}
              onClick={() => {
                lateralScroll(isSmallerThanPhone ? 200 : 350);
              }}
              icon={theme.isRtl ? 'chevron-left' : 'chevron-right'}
              buttonStyle="text"
              p="0px"
            />
          </Box>
        </Box>
      </>
    );
  }
  return null;
};

export default EventPreviews;
