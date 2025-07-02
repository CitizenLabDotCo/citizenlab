import React, {
  useRef,
  useState,
  useLayoutEffect,
  useEffect,
  useCallback,
  useMemo,
} from 'react';

import { Box, Text, colors } from '@citizenlab/cl2-component-library';
import { addMonths, subMonths } from 'date-fns';

import GanttChartLeftColumn from './components/GanttChartLeftColumn';
import GroupedTimeline from './components/GroupedTimeline';
import TimelineItems from './components/TimelineItems';
import TimeRangeSelector from './components/TimeRangeSelector';
import { GanttChartProps } from './types';
import {
  TimeRangeOption,
  getTimeRangeDates,
  scrollTo,
  groupDayCellsByMonth,
  groupWeekCellsByYear,
  groupQuarterCellsByMonth,
  groupMonthCellsByYear,
  getDayCells,
  getWeekCells,
  getQuarterCells,
  getMonthCells,
  getPreciseOffsetInDays,
  getPreciseDurationInDays,
  getPreciseOffsetInMonths,
  getPreciseDurationInMonths,
  getPreciseOffsetInWeeks,
  getPreciseDurationInWeeks,
  getPreciseOffsetInQuarters,
  getPreciseDurationInQuarters,
  quarterWidth,
  weekWidth,
  timelineHeaderHeight,
  rowHeight,
  monthWidth,
  dayWidth,
  leftColumnWidth,
} from './utils';

export const GanttChart = ({
  items,
  chartTitle,
  startDate: initialStartDate,
  endDate: initialEndDate,
  renderItemTooltip,
  showTodayLine = true,
  onItemLabelClick,
}: GanttChartProps) => {
  const today = useMemo(() => new Date(), []);
  const [selectedRange, setSelectedRange] = useState<TimeRangeOption>('year');

  const { startDate: initialStart, endDate: initialEnd } = getTimeRangeDates(
    selectedRange,
    today
  );

  const [startDate, setStartDate] = useState<Date>(
    initialStartDate || initialStart
  );
  const [endDate, setEndDate] = useState<Date>(initialEndDate || initialEnd);
  const [isLoading, setIsLoading] = useState(false);
  const [visibleLabel, setVisibleLabel] = useState<string>('');

  const timelineBodyRef = useRef<HTMLDivElement>(null);
  const scrollState = useRef({ scrollLeft: 0, scrollWidth: 0 });
  const rangeChanged = useRef(true);

  const viewConfig = useMemo(
    () => ({
      month: {
        unitWidth: dayWidth,
        getGroups: (start: Date, end: Date) =>
          groupDayCellsByMonth(getDayCells(start, end), () => dayWidth),
        getFlatCells: getDayCells,
        getOffset: (date: Date) => getPreciseOffsetInDays(startDate, date),
        getDuration: (s: Date, e: Date) => getPreciseDurationInDays(s, e),
      },
      quarter: {
        unitWidth: quarterWidth,
        getGroups: (start: Date, end: Date) =>
          groupQuarterCellsByMonth(
            getQuarterCells(start, end),
            () => quarterWidth
          ),
        getFlatCells: getQuarterCells,
        getOffset: (cells: Date[], date: Date) =>
          getPreciseOffsetInQuarters(cells, date),
        getDuration: (cells: Date[], s: Date, e: Date) =>
          getPreciseDurationInQuarters(cells, s, e),
      },
      year: {
        unitWidth: weekWidth,
        getGroups: (start: Date, end: Date) =>
          groupWeekCellsByYear(getWeekCells(start, end), () => weekWidth),
        getFlatCells: getWeekCells,
        getOffset: (date: Date) => getPreciseOffsetInWeeks(startDate, date),
        getDuration: (s: Date, e: Date) =>
          getPreciseDurationInWeeks(s, e, startDate),
      },
      multiyear: {
        unitWidth: monthWidth,
        getGroups: (start: Date, end: Date) =>
          groupMonthCellsByYear(getMonthCells(start, end), () => monthWidth),
        getFlatCells: getMonthCells,
        getOffset: (date: Date) => getPreciseOffsetInMonths(startDate, date),
        getDuration: (s: Date, e: Date) =>
          getPreciseDurationInMonths(s, e, startDate),
      },
    }),
    [startDate]
  );

  const {
    unitWidth: unitW,
    getGroups,
    getFlatCells,
    getOffset,
    getDuration,
  } = viewConfig[selectedRange];

  const timeGroups = useMemo(
    () => getGroups(startDate, endDate),
    [startDate, endDate, getGroups]
  );
  const flatTimeCells = useMemo(
    () => getFlatCells(startDate, endDate),
    [startDate, endDate, getFlatCells]
  );

  const getOffsetForView = useCallback(
    (date: Date) => {
      if (selectedRange === 'quarter') {
        return (getOffset as (cells: Date[], date: Date) => number)(
          flatTimeCells,
          date
        );
      }
      return (getOffset as (date: Date) => number)(date);
    },
    [selectedRange, getOffset, flatTimeCells]
  );

  const getDurationForView = useCallback(
    (start: Date, end: Date) => {
      if (selectedRange === 'quarter') {
        return (getDuration as (cells: Date[], s: Date, e: Date) => number)(
          flatTimeCells,
          start,
          end
        );
      }
      return (getDuration as (s: Date, e: Date) => number)(start, end);
    },
    [selectedRange, getDuration, flatTimeCells]
  );

  const todayOffset = useMemo(() => {
    if (!showTodayLine) return undefined;
    return getOffsetForView(today);
  }, [getOffsetForView, showTodayLine, today]);

  useLayoutEffect(() => {
    if (timelineBodyRef.current && scrollState.current.scrollWidth > 0) {
      const newWidth = timelineBodyRef.current.scrollWidth;
      const added = newWidth - scrollState.current.scrollWidth;
      timelineBodyRef.current.scrollLeft =
        scrollState.current.scrollLeft + added;
      scrollState.current.scrollWidth = 0;
    }
  }, [startDate]);

  const onTimelineScroll = useCallback(() => {
    if (!timelineBodyRef.current || isLoading) return;
    const { scrollLeft, scrollWidth, clientWidth } = timelineBodyRef.current;
    let cumulativeWidth = 0;
    for (const group of timeGroups) {
      cumulativeWidth += group.totalWidth;
      if (cumulativeWidth >= scrollLeft) {
        if (group.label !== visibleLabel) {
          setVisibleLabel(group.label);
        }
        break;
      }
    }
    const buffer = 800;
    if (scrollLeft + clientWidth >= scrollWidth - buffer) {
      setIsLoading(true);
      setEndDate((prev) => addMonths(prev, 3));
      setTimeout(() => setIsLoading(false), 50);
    }
    if (scrollLeft <= buffer) {
      setIsLoading(true);
      scrollState.current = { scrollLeft, scrollWidth };
      setStartDate((prev) => subMonths(prev, 3));
      setTimeout(() => setIsLoading(false), 50);
    }
  }, [isLoading, timeGroups, visibleLabel]);

  const scrollToToday = useCallback(() => {
    const offset = getOffsetForView(today);
    if (timelineBodyRef.current && timelineBodyRef.current.scrollWidth > 0) {
      scrollTo(timelineBodyRef, offset, unitW);
    }
  }, [getOffsetForView, today, unitW]);

  const handleRangeChange = (range: TimeRangeOption) => {
    rangeChanged.current = true;
    setSelectedRange(range);
    const { startDate: newStart, endDate: newEnd } = getTimeRangeDates(
      range,
      today
    );
    setStartDate(newStart);
    setEndDate(newEnd);
  };

  useEffect(() => {
    if (rangeChanged.current) {
      const timer = setTimeout(() => {
        scrollToToday();
        rangeChanged.current = false;
      }, 100);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [startDate, endDate, scrollToToday]);

  useEffect(() => {
    if (timeGroups.length > 0 && visibleLabel === '') {
      onTimelineScroll();
    }
  }, [timeGroups, visibleLabel, onTimelineScroll]);

  const totalBodyHeight = timelineHeaderHeight + items.length * rowHeight;

  return (
    <Box
      bg={colors.white}
      border={`1px solid ${colors.grey300}`}
      borderRadius="8px"
      overflow="hidden"
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        pl="16px"
        pr="8px"
        py="8px"
      >
        <Text fontSize="l" fontWeight="semi-bold">
          {chartTitle || visibleLabel}
        </Text>
        <TimeRangeSelector
          selectedRange={selectedRange}
          onRangeChange={handleRangeChange}
          onTodayClick={scrollToToday}
        />
      </Box>

      <Box
        display="flex"
        borderTop={`1px solid ${colors.grey300}`}
        position="relative"
      >
        <Box
          width={`${leftColumnWidth}px`}
          minWidth={`${leftColumnWidth}px`}
          position="sticky"
          left="0"
          zIndex="3"
          bg={colors.white}
          borderRight={`1px solid ${colors.grey300}`}
          mt={`${timelineHeaderHeight}px`}
        >
          <GanttChartLeftColumn
            items={items}
            onItemLabelClick={onItemLabelClick}
          />
        </Box>
        <Box
          flex="1"
          overflow="auto"
          ref={timelineBodyRef}
          onScroll={onTimelineScroll}
          bgColor={colors.background}
        >
          <Box position="relative" height={`${totalBodyHeight}px`}>
            <GroupedTimeline
              groups={timeGroups}
              totalBodyHeight={totalBodyHeight}
            />

            {showTodayLine && todayOffset !== undefined && (
              <Box
                position="absolute"
                top={`${timelineHeaderHeight}px`}
                height={`calc(100% - ${timelineHeaderHeight}px)`}
                width="2px"
                bg={colors.primary}
                zIndex="2"
                style={{
                  left: `${todayOffset * unitW - 1}px`, // Center the line on the precise start of the day
                  pointerEvents: 'none',
                }}
              >
                <Box
                  position="absolute"
                  top="-5px"
                  left="-4px"
                  width="10px"
                  height="10px"
                  borderRadius="50%"
                  bg={colors.primary}
                />
              </Box>
            )}

            <TimelineItems
              items={items}
              startDate={startDate}
              endDate={endDate}
              getOffset={getOffsetForView}
              getDuration={getDurationForView}
              unitW={unitW}
              renderItemTooltip={renderItemTooltip}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default GanttChart;
