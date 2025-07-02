import React from 'react';

import { addMonths } from 'date-fns';

import { getDurationInMonths, monthWidth, YearMeta } from '../../utils';

import {
  HeaderRow,
  TopRowCell,
  BottomRowCell,
  HeaderBottomContainer,
} from './HeaderCells';

interface MultiYearViewProps {
  yearMeta: YearMeta[];
  startDate: Date;
  endDate: Date;
}

const MultiYearView = ({
  yearMeta,
  startDate,
  endDate,
}: MultiYearViewProps) => (
  <>
    <HeaderRow>
      {yearMeta.map((year) => (
        <TopRowCell key={year.label} width={year.monthsInYear * monthWidth}>
          {year.label}
        </TopRowCell>
      ))}
    </HeaderRow>
    <HeaderBottomContainer>
      <HeaderRow>
        {Array.from({ length: getDurationInMonths(startDate, endDate) }).map(
          (_, i) => (
            <BottomRowCell key={`month-col-${i}`} width={monthWidth}>
              {addMonths(startDate, i).getMonth() + 1}
            </BottomRowCell>
          )
        )}
      </HeaderRow>
    </HeaderBottomContainer>
  </>
);

export default MultiYearView;
