import React from 'react';

import { Box, colors, Text } from '@citizenlab/cl2-component-library';
import { addMonths, addDays } from 'date-fns';

import {
  getDurationInMonths,
  getDurationInDays,
  MonthMeta,
  YearMeta,
  QuarterCellMeta,
  WeekMeta,
} from './utils';

interface GanttChartHeaderProps {
  isMultiYearView: boolean;
  isYearView: boolean;
  isQuarterView: boolean;
  monthMeta: MonthMeta[];
  yearMeta: YearMeta[];
  quarterCells: QuarterCellMeta[];
  weekCells: WeekMeta[];
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
                >
                  <Text fontSize="xs" color="grey600">
                    {monthLabel}
                  </Text>
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
                  {yearGroups.map((yearGroup) => (
                    <Box
                      key={yearGroup.year}
                      minWidth={`${yearGroup.count * weekWidth}px`}
                      width={`${yearGroup.count * weekWidth}px`}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      borderLeft={`1px solid ${colors.grey300}`}
                    >
                      <Text fontSize="s" fontWeight="semi-bold">
                        {yearGroup.year}
                      </Text>
                    </Box>
                  ))}
                </Box>
                <Box
                  display="flex"
                  height={`${timelineHeight}px`}
                  borderTop={`1px solid ${colors.grey300}`}
                  w="0px"
                >
                  {weekCells.map((weekCell, index) => (
                    <Box
                      key={`week-${index}`}
                      minWidth={`${weekWidth}px`}
                      width={`${weekWidth}px`}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      borderLeft={`1px solid ${colors.divider}`}
                    >
                      <Text fontSize="xs" color="grey600">
                        {weekCell.weekNumber}
                      </Text>
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
                  {monthGroups.map((monthGroup) => (
                    <Box
                      key={monthGroup.month}
                      minWidth={`${monthGroup.count * quarterWidth}px`}
                      width={`${monthGroup.count * quarterWidth}px`}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      borderLeft={`1px solid ${colors.grey300}`}
                    >
                      <Text fontSize="s" fontWeight="semi-bold">
                        {monthGroup.month.split(' ')[0]}
                      </Text>
                    </Box>
                  ))}
                </Box>
                <Box
                  display="flex"
                  height={`${timelineHeight}px`}
                  borderTop={`1px solid ${colors.grey300}`}
                  w="0px"
                >
                  {quarterCells.map((quarterCell, index) => (
                    <Box
                      key={`q-cell-${index}`}
                      minWidth={`${quarterWidth}px`}
                      width={`${quarterWidth}px`}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      borderLeft={`1px solid ${colors.divider}`}
                    >
                      <Text fontSize="xs" color="grey600">
                        {quarterCell.label}
                      </Text>
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
                <Text fontSize="s" fontWeight="semi-bold">
                  {m.label}
                </Text>
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
              >
                <Text fontSize="xs" color="grey600">
                  {addDays(startDate, i).getDate()}
                </Text>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default GanttChartHeader;
