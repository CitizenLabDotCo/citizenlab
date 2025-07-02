import React, {
  useRef,
  useState,
  useLayoutEffect,
  useEffect,
  useCallback,
  useMemo,
} from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';
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

  const isMultiYearView = selectedRange === 'multiyear';
  const isYearView = selectedRange === 'year';
  const isQuarterView = selectedRange === 'quarter';

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

  const unitW = isMultiYearView
    ? monthWidth
    : isYearView
    ? weekWidth
    : isQuarterView
    ? quarterWidth
    : dayWidth;
  const cellCount = useMemo(() => {
    if (isMultiYearView) return getDurationInMonths(startDate, endDate);
    if (isYearView) return weekCells.length;
    if (isQuarterView) return quarterCells.length;
    return getDurationInDays(startDate, endDate);
  }, [
    isMultiYearView,
    isYearView,
    isQuarterView,
    startDate,
    endDate,
    weekCells,
    quarterCells,
  ]);

  const getOffset = useCallback(
    (date: Date) => {
      if (isMultiYearView) return getOffsetInMonths(startDate, date);
      if (isYearView) return getOffsetInWeeks(startDate, date);
      if (isQuarterView) return getOffsetInQuarterCells(quarterCells, date);
      return getOffsetInDays(startDate, date);
    },
    [isMultiYearView, isYearView, isQuarterView, startDate, quarterCells]
  );

  const getDuration = useCallback(
    (start: Date, end: Date) => {
      if (isMultiYearView) return getDurationInMonths(start, end);
      if (isYearView) return getDurationInWeeks(start, end);
      if (isQuarterView) {
        return getDurationInQuarterCells(quarterCells, start, end);
      }
      return getDurationInDays(start, end);
    },
    [isMultiYearView, isYearView, isQuarterView, quarterCells]
  );

  const todayOffset = useMemo(() => {
    if (!showTodayLine) return undefined;
    return getOffset(today);
  }, [getOffset, showTodayLine, today]);

  useLayoutEffect(() => {
    if (!timelineBodyRef.current) return;
    const { scrollLeft } = timelineBodyRef.current;
    let newLabel = '';

    if (isMultiYearView) {
      newLabel = yearMeta[0]?.label ?? '';
    } else if (isYearView) {
      const scrolledWeeks = Math.floor(scrollLeft / weekWidth);
      const currentWeek = weekCells.at(scrolledWeeks);
      if (currentWeek !== undefined) {
        newLabel = String(currentWeek.year);
      }
    } else if (isQuarterView) {
      const scrolledCells = Math.floor(scrollLeft / quarterWidth);
      const currentCell = quarterCells.at(scrolledCells);
      if (currentCell !== undefined) {
        newLabel = currentCell.month;
      }
    } else {
      newLabel = monthMeta[0]?.label ?? '';
    }
    setVisibleLabel(newLabel);
  }, [
    selectedRange,
    isMultiYearView,
    isYearView,
    isQuarterView,
    monthMeta,
    yearMeta,
    weekCells,
    quarterCells,
  ]);

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
    if (isMultiYearView) {
      for (let i = yearMeta.length - 1; i >= 0; i--) {
        const y = yearMeta[i];
        if (scrollLeft >= y.offsetMonths * monthWidth) {
          newLabel = y.label;
          break;
        }
      }
    } else if (isYearView) {
      const scrolledWeeks = Math.floor(scrollLeft / weekWidth);
      const currentWeek = weekCells.at(scrolledWeeks);
      if (currentWeek !== undefined) {
        newLabel = String(currentWeek.year);
      }
    } else if (isQuarterView) {
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
    isMultiYearView,
    isYearView,
    isQuarterView,
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
      bg="#fff"
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
          style={{ left: 0, zIndex: 3 }}
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
            bg="#fafbfc"
            style={{
              fontWeight: 800,
              fontSize: '18px',
              color: '#222',
              letterSpacing: '0.5px',
              zIndex: 2,
            }}
          >
            {visibleLabel}
          </Box>

          <Box ref={timelineHeaderRef} overflow="hidden" bg="#fafbfc">
            <GanttChartHeader
              isMultiYearView={isMultiYearView}
              isYearView={isYearView}
              isQuarterView={isQuarterView}
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
