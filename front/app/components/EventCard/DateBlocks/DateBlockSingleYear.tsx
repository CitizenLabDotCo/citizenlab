import React, { memo } from 'react';

// components
import { EventDateBlock, EventDate, EventYear } from './styling';
import DayAndMonth from './DayAndMonth';

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
        <DayAndMonth day={startAtDay} month={startAtMonth} />

        {isMultiDayEvent && (
          <>
            <span>-</span>
            <DayAndMonth
              day={endAtDay}
              month={isMultiMonthEvent ? endAtMonth : null}
            />
          </>
        )}
      </EventDate>

      <EventYear>
        <span>{startAtYear}</span>
      </EventYear>
    </EventDateBlock>
  );
});
