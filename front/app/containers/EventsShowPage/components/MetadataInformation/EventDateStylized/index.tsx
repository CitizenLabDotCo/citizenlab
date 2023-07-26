import React from 'react';
import moment from 'moment';

// typing
import { IEventData } from 'api/events/types';

// components
import { Box, Text } from '@citizenlab/cl2-component-library';
import SingleDateStylized from './SingleDateStylized';

// utils
import { toThreeLetterMonth } from 'utils/dateUtils';

interface Props {
  event: IEventData;
}

const EventDateStylized = ({ event }: Props) => {
  const startAtMoment = moment(event.attributes.start_at);
  const endAtMoment = moment(event.attributes.end_at);
  const startDateMonth = toThreeLetterMonth(event.attributes.start_at, 'month');
  const endDateMonth = toThreeLetterMonth(event.attributes.end_at, 'month');
  const isEventMultipleDays =
    startAtMoment.dayOfYear() !== endAtMoment.dayOfYear();
  const oneDayEventTime = `${startAtMoment.format('LT')} - ${endAtMoment.format(
    'LT'
  )}`;

  return (
    <Box display="flex" justifyContent="center">
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
              →
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
