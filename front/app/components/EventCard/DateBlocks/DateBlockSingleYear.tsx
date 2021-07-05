import React, { memo } from 'react';

// components
import {
  EventDateBlock,
  EventDate,
  EventMonth,
  EventDay,
  EventYear,
} from './styling';

interface Props {
  startAtDay: string;
  endAtDay?: string;
  startAtMonth: string;
  endAtMonth?: string;
  startAtYear: string;
  isMultiDayEvent?: boolean;
}

export default memo<Props>((props) => {
  const {
    startAtDay,
    endAtDay,
    startAtMonth,
    endAtMonth,
    startAtYear,
    isMultiDayEvent,
  } = props;

  const isMultiMonthEvent = startAtMonth !== endAtMonth;

  return (
    <EventDateBlock>
      <EventDate>
        <EventMonth>{startAtMonth}</EventMonth>
        <EventDay>{startAtDay}</EventDay>
        {isMultiDayEvent && (
          <>
            -{isMultiMonthEvent && <EventMonth>{endAtMonth}</EventMonth>}
            <EventDay>{endAtDay}</EventDay>
          </>
        )}
      </EventDate>
      <EventYear>
        <span>{startAtYear}</span>
      </EventYear>
    </EventDateBlock>
  );
});
