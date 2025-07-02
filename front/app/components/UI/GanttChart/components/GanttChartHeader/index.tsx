import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import {
  MonthMeta,
  YearMeta,
  QuarterCellMeta,
  WeekMeta,
  TimeRangeOption,
} from '../../utils';

import MonthView from './MonthView';
import MultiYearView from './MultiYearView';
import QuarterView from './QuarterView';
import YearView from './YearView';

interface GanttChartHeaderProps {
  selectedRange: TimeRangeOption;
  monthMeta: MonthMeta[];
  yearMeta: YearMeta[];
  quarterCells: QuarterCellMeta[];
  weekCells: WeekMeta[];
  startDate: Date;
  endDate: Date;
}

const GanttChartHeader: React.FC<GanttChartHeaderProps> = (props) => {
  const { selectedRange, startDate, endDate, ...rest } = props;

  const renderView = () => {
    switch (selectedRange) {
      case 'multiyear':
        return (
          <MultiYearView
            yearMeta={rest.yearMeta}
            startDate={startDate}
            endDate={endDate}
          />
        );
      case 'year':
        return <YearView weekCells={rest.weekCells} />;
      case 'quarter':
        return <QuarterView quarterCells={rest.quarterCells} />;
      case 'month':
      default:
        return (
          <MonthView
            monthMeta={rest.monthMeta}
            startDate={startDate}
            endDate={endDate}
          />
        );
    }
  };

  return <Box>{renderView()}</Box>;
};

export default GanttChartHeader;
