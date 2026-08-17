import React, { memo } from 'react';

import { media } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useLocale from 'hooks/useLocale';

import {
  formatDayOfMonth,
  formatMonthShort,
  formatYear,
  getViewerZone,
} from 'utils/dateFormat';

import DateBlockSingleYear from './DateBlockSingleYear';
import DateBlocksMultiYear from './DateBlocksMultiYear';
import { EventDateBlockWrapper } from './styling';

const EventDateBlocks = styled.div`
  flex: 0 0 75px;
  width: 75px;
  display: flex;
  flex-direction: column;
  align-items: stretch;

  ${media.phone`
    flex: 0 0 60px;
    width: 60x;
  `}
`;

interface Props {
  startAt: string;
  endAt: string;
  isMultiDayEvent: boolean;
  showOnlyStartDate?: boolean;
}

export default memo<Props>(
  ({ startAt, endAt, isMultiDayEvent, showOnlyStartDate }) => {
    const locale = useLocale();
    // Event dates are shown on the viewer's clock, matching the rest of the
    // event UI.
    const inViewerZone = { timeZone: getViewerZone() };
    const startAtDay = formatDayOfMonth(startAt, locale, inViewerZone);
    const endAtDay = formatDayOfMonth(endAt, locale, inViewerZone);
    const startAtMonth = formatMonthShort(startAt, locale, inViewerZone);
    const endAtMonth = formatMonthShort(endAt, locale, inViewerZone);
    const startAtYear = formatYear(startAt, inViewerZone);
    const endAtYear = formatYear(endAt, inViewerZone);
    const isMultiYearEvent = !showOnlyStartDate && startAtYear !== endAtYear;

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
