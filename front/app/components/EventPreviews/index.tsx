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
import useProjectBySlug from 'api/projects/useProjectBySlug';

// style
import styled, { useTheme } from 'styled-components';

// intl
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

// router
import { useParams } from 'react-router-dom';

// util
import moment from 'moment';

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
  const projectType = project?.data.attributes.process_type;
  const { data: phases } = usePhases(projectIdToUse);
  const { data: events } = useEvents({
    projectIds: projectIdToUse ? [projectIdToUse] : undefined,
    currentAndFutureOnly: true,
    sort: '-start_at',
    ongoing_during:
      projectType === 'timeline'
        ? [
            moment(
              getCurrentPhase(phases?.data)?.attributes.start_at
            ).toString() || null,
            moment(getCurrentPhase(phases?.data)?.attributes.end_at)
              .add(1, 'day')
              .toString() || null,
          ]
        : undefined,
  });

  // scrolling
  const [atScrollStart, setAtScrollStart] = useState(true);
  const [atScrollEnd, setAtScrollEnd] = useState(false);
  const showArrows =
    ref?.current && ref.current.scrollWidth > ref.current.clientWidth;
  const [showArrowButtons, setShowArrowButtons] = useState(showArrows);

  useEffect(() => {
    setShowArrowButtons(
      ref?.current && ref.current.scrollWidth > ref.current.clientWidth
    );
  }, [showArrows]);

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
        <Title
          color="tenantText"
          mt="36px"
          mb="8px"
          variant="h5"
          style={{ fontWeight: 600 }}
        >
          {projectType === 'continuous'
            ? formatMessage(messages.eventPreviewContinuousTitle)
            : formatMessage(messages.eventPreviewTimelineTitle)}
          :
        </Title>
        <Box
          id="e2e-event-previews"
          display="flex"
          flexDirection={theme.isRtl ? 'row-reverse' : 'row'}
        >
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
              id="e2e-event-previews-scroll-left"
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
              <EventPreviewCard key={event.id} event={event} />
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
              id="e2e-event-previews-scroll-right"
            />
          </Box>
        </Box>
      </>
    );
  }
  return null;
};

export default EventPreviews;
