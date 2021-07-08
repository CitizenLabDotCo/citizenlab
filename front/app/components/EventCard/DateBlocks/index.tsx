import React, { memo } from 'react';
import moment from 'moment';

// components
import { EventDateBlockWrapper } from './styling';
import DateBlockSingleYear from './DateBlockSingleYear';
import DateBlocksMultiYear from './DateBlocksMultiYear';

// styling
import styled from 'styled-components';
import { media } from 'utils/styleUtils';

const EventDateBlocks = styled.div`
  flex: 0 0 75px;
  width: 75px;
  display: flex;
  flex-direction: column;
  align-items: stretch;

  ${media.smallerThanMinTablet`
    flex: 0 0 60px;
    width: 60x;
  `}
`;

interface Props {
  startAtMoment: moment.Moment;
  endAtMoment: moment.Moment;
  isMultiDayEvent: boolean;
}

export default memo<Props>(
  ({ startAtMoment, endAtMoment, isMultiDayEvent }) => {
    const startAtDay = startAtMoment.format('DD');
    const endAtDay = endAtMoment.format('DD');
    const startAtMonth = startAtMoment.format('MMM');
    const endAtMonth = endAtMoment.format('MMM');
    const startAtYear = startAtMoment.format('YYYY');
    const endAtYear = endAtMoment.format('YYYY');

    const isMultiYearEvent = startAtYear !== endAtYear;

    return (
      <EventDateBlocks aria-hidden>
        {!isMultiYearEvent && (
          <EventDateBlockWrapper>
            <DateBlockSingleYear
              startAtDay={startAtDay}
              endAtDay={endAtDay}
              startAtMonth={startAtMonth}
              endAtMonth={endAtMonth}
              startAtYear={startAtYear}
              isMultiDayEvent={isMultiDayEvent}
            />
          </EventDateBlockWrapper>
        )}

        {isMultiYearEvent && (
          <DateBlocksMultiYear
            startAtDay={startAtDay}
            endAtDay={endAtDay}
            startAtMonth={startAtMonth}
            endAtMonth={endAtMonth}
            startAtYear={startAtYear}
            endAtYear={endAtYear}
          />
        )}
      </EventDateBlocks>
    );
  }
);
