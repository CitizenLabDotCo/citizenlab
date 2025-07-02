import React from 'react';

import { weekWidth, WeekMeta, getYearGroups } from '../../utils';

import {
  HeaderRow,
  TopRowCell,
  BottomRowCell,
  HeaderBottomContainer,
} from './HeaderCells';

interface YearViewProps {
  weekCells: WeekMeta[];
}

const YearView = ({ weekCells }: YearViewProps) => {
  const yearGroups = getYearGroups(weekCells);
  return (
    <>
      <HeaderRow>
        {yearGroups.map((group) => (
          <TopRowCell key={group.year} width={group.count * weekWidth}>
            {group.year}
          </TopRowCell>
        ))}
      </HeaderRow>
      <HeaderBottomContainer>
        <HeaderRow>
          {weekCells.map((weekCell, index) => (
            <BottomRowCell key={`week-${index}`} width={weekWidth}>
              {weekCell.weekNumber}
            </BottomRowCell>
          ))}
        </HeaderRow>
      </HeaderBottomContainer>
    </>
  );
};

export default YearView;
