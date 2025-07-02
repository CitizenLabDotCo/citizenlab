import React from 'react';

import { quarterWidth, QuarterCellMeta, getMonthGroups } from '../../utils';

import {
  HeaderRow,
  TopRowCell,
  BottomRowCell,
  HeaderBottomContainer,
} from './HeaderCells';

interface QuarterViewProps {
  quarterCells: QuarterCellMeta[];
}

const QuarterView: React.FC<QuarterViewProps> = ({ quarterCells }) => {
  const monthGroups = getMonthGroups(quarterCells);
  return (
    <>
      <HeaderRow>
        {monthGroups.map((group) => (
          <TopRowCell key={group.month} width={group.count * quarterWidth}>
            {group.month.split(' ')[0]}
          </TopRowCell>
        ))}
      </HeaderRow>
      <HeaderBottomContainer>
        <HeaderRow>
          {quarterCells.map((cell, index) => (
            <BottomRowCell key={`q-cell-${index}`} width={quarterWidth}>
              {cell.label}
            </BottomRowCell>
          ))}
        </HeaderRow>
      </HeaderBottomContainer>
    </>
  );
};

export default QuarterView;
