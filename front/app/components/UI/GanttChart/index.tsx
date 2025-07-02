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

import GanttChartHeader from './components/GanttChartHeader';
import GanttChartLeftColumn from './components/GanttChartLeftColumn';
import TimelineGrid from './components/TimelineGrid';
import TimelineItems from './components/TimelineItems';
import TimeRangeSelector from './components/TimeRangeSelector';
import { GanttChartProps } from './types';
import {
  getTimeRangeDates,
  getMonthMeta,
  getYearMeta,
  scrollTo,
  TimeRangeOption,
  getOffsetInDays,
  getDurationInDays,
  getOffsetInMonths,
  getDurationInMonths,
  getQuarterCellsMeta,
  getOffsetInQuarterCells,
  getDurationInQuarterCells,
  getWeekMeta,
  getOffsetInWeeks,
  getDurationInWeeks,
} from './utils';

const quarterWidth = 48;
const weekWidth = 48;
const timelineHeight = 40;
const rowHeight = 40;
const monthWidth = 50;
const dayWidth = 40;
const leftColumnWidth = 260;

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

  const timelineHeaderRef = useRef<HTMLDivElement>(null);
  const timelineBodyRef = useRef<HTMLDivElement>(null);
  const scrollState = useRef({ scrollLeft: 0, scrollWidth: 0 });
  const rangeChanged = useRef(true);

  const monthMeta = useMemo(
    () => getMonthMeta(startDate, endDate),
    [startDate, endDate]
  );
  const yearMeta = useMemo(
    () => getYearMeta(startDate, endDate),
    [startDate, endDate]
  );
  const quarterCells = useMemo(
    () => getQuarterCellsMeta(startDate, endDate),
    [startDate, endDate]
  );
  const weekCells = useMemo(
    () => getWeekMeta(startDate, endDate),
    [startDate, endDate]
  );

  // Centralize per-view configuration
  const viewConfig = useMemo(
    () => ({
      month: {
        unitWidth: dayWidth,
        getCellCount: () => getDurationInDays(startDate, endDate),
        getOffset: (date: Date) => getOffsetInDays(startDate, date),
        getDuration: (s: Date, e: Date) => getDurationInDays(s, e),
      },
      quarter: {
        unitWidth: quarterWidth,
        getCellCount: () => quarterCells.length,
        getOffset: (date: Date) => getOffsetInQuarterCells(quarterCells, date),
        getDuration: (s: Date, e: Date) =>
          getDurationInQuarterCells(quarterCells, s, e),
      },
      year: {
        unitWidth: weekWidth,
        getCellCount: () => weekCells.length,
        getOffset: (date: Date) => getOffsetInWeeks(startDate, date),
        getDuration: (s: Date, e: Date) => getDurationInWeeks(s, e),
      },
      multiyear: {
        unitWidth: monthWidth,
        getCellCount: () => getDurationInMonths(startDate, endDate),
        getOffset: (date: Date) => getOffsetInMonths(startDate, date),
        getDuration: (s: Date, e: Date) => getDurationInMonths(s, e),
      },
    }),
    [startDate, endDate, weekCells, quarterCells]
  );

  const {
    unitWidth: unitW,
    getCellCount,
    getOffset,
    getDuration,
  } = viewConfig[selectedRange];
  const cellCount = getCellCount();

  const todayOffset = useMemo(() => {
    if (!showTodayLine) return undefined;
    return getOffset(today);
  }, [getOffset, showTodayLine, today]);

  useLayoutEffect(() => {
    if (!timelineBodyRef.current) return;
    const { scrollLeft } = timelineBodyRef.current;
    let newLabel = '';

    if (selectedRange === 'multiyear') {
      newLabel = yearMeta[0]?.label ?? '';
    } else if (selectedRange === 'year') {
      const scrolledWeeks = Math.floor(scrollLeft / weekWidth);
      const currentWeek = weekCells.at(scrolledWeeks);
      if (currentWeek !== undefined) {
        newLabel = String(currentWeek.year);
      }
    } else if (selectedRange === 'quarter') {
      const scrolledCells = Math.floor(scrollLeft / quarterWidth);
      const currentCell = quarterCells.at(scrolledCells);
      if (currentCell !== undefined) {
        newLabel = currentCell.month;
      }
    } else {
      newLabel = monthMeta[0]?.label ?? '';
    }
    setVisibleLabel(newLabel);
  }, [selectedRange, monthMeta, yearMeta, weekCells, quarterCells]);

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
    if (timelineHeaderRef.current) {
      timelineHeaderRef.current.scrollLeft = scrollLeft;
    }

    let newLabel = '';
    if (selectedRange === 'multiyear') {
      for (let i = yearMeta.length - 1; i >= 0; i--) {
        const y = yearMeta[i];
        if (scrollLeft >= y.offsetMonths * monthWidth) {
          newLabel = y.label;
          break;
        }
      }
    } else if (selectedRange === 'year') {
      const scrolledWeeks = Math.floor(scrollLeft / weekWidth);
      const currentWeek = weekCells.at(scrolledWeeks);
      if (currentWeek !== undefined) {
        newLabel = String(currentWeek.year);
      }
    } else if (selectedRange === 'quarter') {
      const scrolledCells = Math.floor(scrollLeft / quarterWidth);
      const currentCell = quarterCells.at(scrolledCells);
      if (currentCell !== undefined) {
        newLabel = currentCell.month;
      }
    } else {
      for (let i = monthMeta.length - 1; i >= 0; i--) {
        const m = monthMeta[i];
        if (scrollLeft >= m.offsetDays * dayWidth) {
          newLabel = m.label;
          break;
        }
      }
    }

    if (newLabel && newLabel !== visibleLabel) {
      setVisibleLabel(newLabel);
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
  }, [
    isLoading,
    selectedRange,
    monthMeta,
    yearMeta,
    weekCells,
    quarterCells,
    visibleLabel,
  ]);

  const scrollToToday = useCallback(() => {
    const offset = getOffset(today);
    if (timelineBodyRef.current && timelineBodyRef.current.scrollWidth > 0) {
      scrollTo(timelineBodyRef, offset, unitW);
    }
  }, [getOffset, today, unitW]);

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

  const handleTodayClick = () => {
    scrollToToday();
  };

  useEffect(() => {
    if (rangeChanged.current) {
      const timer = setTimeout(() => {
        scrollToToday();
        rangeChanged.current = false;
      }, 50);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [startDate, endDate, scrollToToday]);

  return (
    <Box
      bg={colors.white}
      border={`1px solid ${colors.grey300}`}
      borderRadius="8px"
      overflow="hidden"
    >
      <Box display="flex" justifyContent="flex-end" mb="8px">
        <TimeRangeSelector
          selectedRange={selectedRange}
          onRangeChange={handleRangeChange}
          onTodayClick={handleTodayClick}
        />
      </Box>

      <Box display="flex" boxShadow={`0 1px 0 ${colors.grey300}`}>
        <Box
          width={`${leftColumnWidth}px`}
          minWidth={`${leftColumnWidth}px`}
          position="sticky"
          display="flex"
          alignItems="center"
          height={`${timelineHeight * 2}px`}
          pl="16px"
          bg={colors.white}
        >
          {chartTitle}
        </Box>
        <Box flex="1" overflow="hidden" position="relative">
          <Box
            position="absolute"
            height={`${timelineHeight}px`}
            display="flex"
            alignItems="center"
            pl="16px"
            pr="16px"
            zIndex="2"
            bg={colors.white}
          >
            <Text fontSize="l" fontWeight="semi-bold">
              {visibleLabel}
            </Text>
          </Box>

          <Box ref={timelineHeaderRef} overflow="hidden" bg={colors.white}>
            <GanttChartHeader
              selectedRange={selectedRange}
              monthMeta={monthMeta}
              yearMeta={yearMeta}
              quarterCells={quarterCells}
              weekCells={weekCells}
              startDate={startDate}
              endDate={endDate}
              monthWidth={monthWidth}
              weekWidth={weekWidth}
              quarterWidth={quarterWidth}
              dayWidth={dayWidth}
              timelineHeight={timelineHeight}
              getDurationInMonths={getDurationInMonths}
              getDurationInDays={getDurationInDays}
            />
          </Box>
        </Box>
      </Box>

      <Box display="flex">
        <GanttChartLeftColumn
          items={items}
          rowHeight={rowHeight}
          onItemLabelClick={onItemLabelClick}
          leftColumnWidth={leftColumnWidth}
        />
        <Box
          flex="1"
          overflow="auto"
          ref={timelineBodyRef}
          onScroll={onTimelineScroll}
          bgColor={colors.background}
          position="relative"
        >
          <Box position="relative">
            <TimelineGrid
              cellCount={cellCount}
              unitW={unitW}
              showTodayLine={showTodayLine}
              todayOffset={todayOffset}
            />

            <TimelineItems
              items={items}
              rowHeight={rowHeight}
              startDate={startDate}
              endDate={endDate}
              getOffset={getOffset}
              getDuration={getDuration}
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
