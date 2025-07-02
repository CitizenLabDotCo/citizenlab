import React from 'react';

import { addDays } from 'date-fns';

import { getDurationInDays, dayWidth, MonthMeta } from '../../utils';

import {
  HeaderRow,
  TopRowCell,
  BottomRowCell,
  HeaderBottomContainer,
} from './HeaderCells';

interface MonthViewProps {
  monthMeta: MonthMeta[];
  startDate: Date;
  endDate: Date;
}

const MonthView: React.FC<MonthViewProps> = ({
  monthMeta,
  startDate,
  endDate,
}) => (
  <>
    <HeaderRow>
      {monthMeta.map((m) => (
        <TopRowCell key={m.label} width={m.daysInMonth * dayWidth}>
          {m.label}
        </TopRowCell>
      ))}
    </HeaderRow>
    <HeaderBottomContainer>
      <HeaderRow>
        {Array.from({ length: getDurationInDays(startDate, endDate) }).map(
          (_, i) => (
            <BottomRowCell key={`day-${i}`} width={dayWidth}>
              {addDays(startDate, i).getDate()}
            </BottomRowCell>
          )
        )}
      </HeaderRow>
    </HeaderBottomContainer>
  </>
);

export default MonthView;
