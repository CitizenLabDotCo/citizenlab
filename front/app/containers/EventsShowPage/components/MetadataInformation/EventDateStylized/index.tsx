import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';
import moment from 'moment';
import { useTheme } from 'styled-components';

import { IEventData } from 'api/events/types';

import SingleDateStylized from './SingleDateStylized';

interface Props {
  event: IEventData;
}

const EventDateStylized = ({ event }: Props) => {
  const theme = useTheme();
  const startAtMoment = moment(event.attributes.start_at);
  const endAtMoment = moment(event.attributes.end_at);
  const startDateMonth = startAtMoment.format('MMM');
  const endDateMonth = endAtMoment.format('MMM');
  const isEventMultipleDays =
    startAtMoment.dayOfYear() !== endAtMoment.dayOfYear();
  const oneDayEventTime = `${startAtMoment.format('LT')} - ${endAtMoment.format(
    'LT'
  )}`;

  return (
    <Box
      display="flex"
      flexDirection={theme.isRtl ? 'row-reverse' : 'row'}
      justifyContent="center"
      id="e2e-event-date-stylized"
    >
      <SingleDateStylized
        day={startAtMoment.format('DD')}
        month={startDateMonth}
        time={
          isEventMultipleDays
            ? `${startAtMoment.format('LT')}`
            : oneDayEventTime
        }
      />
      {isEventMultipleDays && (
        <>
          <Box mx="16px" my="auto">
            <Text m="0px" fontWeight="bold" fontSize="xxl">
              {theme.isRtl ? '←' : '→'}
            </Text>
          </Box>
          <SingleDateStylized
            day={endAtMoment.format('DD')}
            month={endDateMonth}
            time={`${endAtMoment.format('LT')}`}
          />
        </>
      )}
    </Box>
  );
};

export default EventDateStylized;
