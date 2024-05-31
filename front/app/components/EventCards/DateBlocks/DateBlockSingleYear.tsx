import React, { memo } from 'react';

import DayAndMonth from './DayAndMonth';
import { EventDateBlock, EventDate, EventYear } from './styling';

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
