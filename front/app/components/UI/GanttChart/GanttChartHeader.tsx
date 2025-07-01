import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';
import { addMonths, addDays } from 'date-fns';

import {
  getDurationInMonths,
  getDurationInDays,
  MonthMeta,
  YearMeta,
} from './utils';

interface QuarterCell {
  label: string;
  month: string;
}

interface WeekCell {
  year: number;
  weekNumber: number;
}

interface GanttChartHeaderProps {
  isMultiYearView: boolean;
  isYearView: boolean;
  isQuarterView: boolean;
  monthMeta: MonthMeta[];
  yearMeta: YearMeta[];
  quarterCells: QuarterCell[];
  weekCells: WeekCell[];
  startDate: Date;
  endDate: Date;
  monthWidth: number;
  weekWidth: number;
  quarterWidth: number;
  dayWidth: number;
  timelineHeight: number;
  getDurationInMonths: typeof getDurationInMonths;
  getDurationInDays: typeof getDurationInDays;
}

const GanttChartHeader: React.FC<GanttChartHeaderProps> = ({
  isMultiYearView,
  isYearView,
  isQuarterView,
  monthMeta,
  yearMeta,
  quarterCells,
  weekCells,
  startDate,
  endDate,
  monthWidth,
  weekWidth,
  quarterWidth,
  dayWidth,
  timelineHeight,
  getDurationInMonths,
  getDurationInDays,
}) => {
  return (
    <Box>
      {isMultiYearView ? (
        <Box>
          <Box display="flex" height={`${timelineHeight}px`} w="0px">
            {yearMeta.map((year) => (
              <Box
                key={year.label}
                minWidth={`${year.monthsInYear * monthWidth}px`}
                width={`${year.monthsInYear * monthWidth}px`}
                display="flex"
                alignItems="center"
                justifyContent="center"
                borderLeft={`1px solid ${colors.grey300}`}
                style={{ color: 'transparent' }}
              >
                {year.label}
              </Box>
            ))}
          </Box>
          <Box
            display="flex"
            height={`${timelineHeight}px`}
            borderTop={`1px solid ${colors.grey300}`}
            w="0px"
          >
            {Array.from({
              length: getDurationInMonths(startDate, endDate),
            }).map((_, i) => {
              const monthLabel = addMonths(startDate, i).getMonth() + 1;
              return (
                <Box
                  key={`month-col-${i}`}
                  minWidth={`${monthWidth}px`}
                  width={`${monthWidth}px`}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  borderLeft={`1px solid ${colors.divider}`}
                  style={{ color: '#888', fontSize: '12px' }}
                >
                  {monthLabel}
                </Box>
              );
            })}
          </Box>
        </Box>
      ) : isYearView ? (
        <Box>
          {(() => {
            const yearGroups: { year: number; count: number }[] = [];
            weekCells.forEach((w) => {
              const lastGroup = yearGroups.at(-1);
              if (lastGroup && lastGroup.year === w.year) {
                lastGroup.count++;
              } else {
                yearGroups.push({ year: w.year, count: 1 });
              }
            });
            return (
              <>
                <Box display="flex" height={`${timelineHeight}px`} w="0px">
                  {yearGroups.map((g) => (
                    <Box
                      key={g.year}
                      minWidth={`${g.count * weekWidth}px`}
                      width={`${g.count * weekWidth}px`}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      borderLeft={`1px solid ${colors.grey300}`}
                      style={{
                        color: '#222',
                        fontWeight: 700,
                        fontSize: '14px',
                      }}
                    >
                      {g.year}
                    </Box>
                  ))}
                </Box>
                <Box
                  display="flex"
                  height={`${timelineHeight}px`}
                  borderTop={`1px solid ${colors.grey300}`}
                  w="0px"
                >
                  {weekCells.map((w, i) => (
                    <Box
                      key={`week-${i}`}
                      minWidth={`${weekWidth}px`}
                      width={`${weekWidth}px`}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      borderLeft={`1px solid ${colors.divider}`}
                      style={{ color: '#888', fontSize: '12px' }}
                    >
                      {`W${w.weekNumber}`}
                    </Box>
                  ))}
                </Box>
              </>
            );
          })()}
        </Box>
      ) : isQuarterView ? (
        <Box>
          {(() => {
            const monthGroups: { month: string; count: number }[] = [];
            quarterCells.forEach((cell) => {
              const lastGroup = monthGroups.at(-1);
              if (lastGroup && lastGroup.month === cell.month) {
                lastGroup.count++;
              } else {
                monthGroups.push({ month: cell.month, count: 1 });
              }
            });
            return (
              <>
                <Box display="flex" height={`${timelineHeight}px`} w="0px">
                  {monthGroups.map((g) => (
                    <Box
                      key={g.month}
                      minWidth={`${g.count * quarterWidth}px`}
                      width={`${g.count * quarterWidth}px`}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      borderLeft={`1px solid ${colors.grey300}`}
                      style={{
                        color: '#222',
                        fontWeight: 700,
                        fontSize: '14px',
                      }}
                    >
                      {g.month.split(' ')[0]}
                    </Box>
                  ))}
                </Box>
                <Box
                  display="flex"
                  height={`${timelineHeight}px`}
                  borderTop={`1px solid ${colors.grey300}`}
                  w="0px"
                >
                  {quarterCells.map((q, i) => (
                    <Box
                      key={`q-cell-${i}`}
                      minWidth={`${quarterWidth}px`}
                      width={`${quarterWidth}px`}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      borderLeft={`1px solid ${colors.divider}`}
                      style={{ color: '#888', fontSize: '12px' }}
                    >
                      {q.label}
                    </Box>
                  ))}
                </Box>
              </>
            );
          })()}
        </Box>
      ) : (
        <Box>
          <Box display="flex" height={`${timelineHeight}px`} w="0px">
            {monthMeta.map((m) => (
              <Box
                key={m.label}
                minWidth={`${m.daysInMonth * dayWidth}px`}
                width={`${m.daysInMonth * dayWidth}px`}
                display="flex"
                alignItems="center"
                justifyContent="center"
                borderLeft={`1px solid ${colors.grey300}`}
              >
                {m.label}
              </Box>
            ))}
          </Box>
          <Box
            display="flex"
            height={`${timelineHeight}px`}
            borderTop={`1px solid ${colors.grey300}`}
            width="0px"
          >
            {Array.from({
              length: getDurationInDays(startDate, endDate),
            }).map((_, i) => (
              <Box
                key={`day-${i}`}
                minWidth={`${dayWidth}px`}
                width={`${dayWidth}px`}
                display="flex"
                alignItems="center"
                justifyContent="center"
                borderLeft={`1px solid ${colors.divider}`}
                style={{ color: '#888', fontSize: '12px' }}
              >
                {addDays(startDate, i).getDate()}
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default GanttChartHeader;
