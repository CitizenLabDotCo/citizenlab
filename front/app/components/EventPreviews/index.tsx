import React, { useRef, useState } from 'react';

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
  const isSmallerThanPhone = useBreakpoint('phone');
  const isTabletOrSmaller = useBreakpoint('tablet');

  const theme = useTheme();
  const { data: phases } = usePhases(projectId);
  const ref = useRef<HTMLDivElement>(null);
  const { data: events } = useEvents({
    projectIds: projectId ? [projectId] : undefined,
    sort: '-start_at',
  });

  const [atScrollStart, setAtScrollStart] = useState(true);
  const [atScrollEnd, setAtScrollEnd] = useState(false);

  const numberOfEvents = ref.current?.children.length;
  const currentPhase = getCurrentPhase(phases?.data);
  const showArrowButtons =
    numberOfEvents &&
    ((!isTabletOrSmaller && numberOfEvents > 3) ||
      (isSmallerThanPhone && numberOfEvents > 1) ||
      (isTabletOrSmaller && numberOfEvents > 2));

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
        {!!(numberOfEvents && numberOfEvents > 0) && (
          <Title mt="36px" mb="8px" variant="h5" style={{ fontWeight: 600 }}>
            {formatMessage(messages.eventPreviewSectionTitle)}:
          </Title>
        )}

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
            justifyContent="space-between"
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
