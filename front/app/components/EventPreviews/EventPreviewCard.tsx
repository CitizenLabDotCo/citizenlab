import React from 'react';

// components
import {
  Box,
  colors,
  defaultCardHoverStyle,
  defaultCardStyle,
  Text,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';
import DayAndMonth from 'components/EventCard/DateBlocks/DayAndMonth';

// api
import useLocalize from 'hooks/useLocalize';

// style
import styled, { useTheme } from 'styled-components';
import moment from 'moment';

// utils
import clHistory from 'utils/cl-router/history';

// typing
import { IEventData } from 'api/events/types';
import { IPhaseData } from 'api/phases/types';

const EventCard = styled(Box)`
  ${defaultCardStyle};
  flex-shrink: 0;

  &:hover {
    ${defaultCardHoverStyle};
    transform: translate(0px, 0px);
    cursor: pointer;
  }
`;

const StyledEventTitle = styled(Text)`
  text-overflow: ellipsis;
  max-width: 260px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

type EventPreviewCardProps = {
  currentPhase?: IPhaseData;
  event: IEventData;
};

const eventOccursInPhase = (event, phase) => {
  return moment(event.attributes.start_at).isBetween(
    moment(phase?.attributes.start_at),
    moment(phase?.attributes.end_at).add(1, 'day')
  );
};

const EventPreviewCard = ({ currentPhase, event }: EventPreviewCardProps) => {
  const isMobile = useBreakpoint('phone');
  const localize = useLocalize();
  const theme = useTheme();

  if (eventOccursInPhase(event, currentPhase)) {
    return (
      <EventCard
        display="flex"
        flexDirection={theme.isRtl ? 'row-reverse' : 'row'}
        borderLeft={
          !theme.isRtl ? `4px solid ${theme.colors.tenantPrimary}` : undefined
        }
        borderRight={
          theme.isRtl ? `4px solid ${theme.colors.tenantPrimary}` : undefined
        }
        w={isMobile ? '350px' : '350px'}
        role="button"
        h="58px"
        onClick={() => {
          clHistory.push(`/events/${event.id}`);
        }}
        py="4px"
        flexShrink={0}
      >
        <Box
          height="100%"
          flexDirection={'row'}
          style={{ textAlign: 'center' }}
          p="12px"
          ml={!theme.isRtl ? '12px' : '8px'}
          mr={theme.isRtl ? '12px' : '8px'}
          borderRadius="3px"
          bgColor={colors.grey100}
          border={`1px solid ${colors.divider}`}
        >
          <Box mt="-3px">
            <DayAndMonth
              day={moment(event.attributes.start_at).format('DD')}
              month={moment(event.attributes.start_at).format('MMM')}
            />
          </Box>
        </Box>
        <StyledEventTitle
          m="0px"
          ml="12px"
          fontSize={isMobile ? 's' : 'm'}
          maxWidth="260px"
          style={{ fontWeight: 600 }}
          my="auto"
        >
          {localize(event.attributes.title_multiloc)}
        </StyledEventTitle>
      </EventCard>
    );
  }

  return null;
};

export default EventPreviewCard;
