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
import { useGanttViewConfig } from './hooks/useGanttViewConfig';
import { GanttChartProps } from './types';
import {
  TimeRangeOption,
  getTimeRangeDates,
  timelineHeaderHeight,
  rowHeight,
  leftColumnWidth,
} from './utils';

const GanttChart = ({
  items,
  chartTitle,
  renderItemTooltip,
  showTodayLine = true,
  onItemLabelClick,
}: GanttChartProps) => {
  const today = useMemo(() => new Date(), []);
  const [selectedRange, setSelectedRange] = useState<TimeRangeOption>('year');
  const { startDate: baselineStartDate, endDate: rangeEndDate } =
    getTimeRangeDates(selectedRange, today);
  const [timelineStartDate, setTimelineStartDate] =
    useState<Date>(baselineStartDate);
  const [endDate, setEndDate] = useState<Date>(rangeEndDate);

  const [isLoading, setIsLoading] = useState(false);
  const [visibleLabel, setVisibleLabel] = useState<string>('');
  const timelineBodyRef = useRef<HTMLDivElement>(null);
  const scrollState = useRef({ scrollLeft: 0, scrollWidth: 0 });
  const didInitialScroll = useRef(false);
  const rangeChanged = useRef(true);
  const viewConfig = useGanttViewConfig(timelineStartDate);

  const {
    unitWidth: unitWidth,
    getGroups,
    getFlatCells,
    getOffset,
    getDuration,
  } = viewConfig[selectedRange];

  const timeGroups = useMemo(
    () => getGroups(timelineStartDate, endDate),
    [timelineStartDate, endDate, getGroups]
  );
  const flatTimeCells = useMemo(
    () => getFlatCells(timelineStartDate, endDate),
    [timelineStartDate, endDate, getFlatCells]
  );

  const getOffsetForView = useCallback(
    (date: Date) =>
      selectedRange === 'quarter'
        ? (getOffset as (cells: Date[], date: Date) => number)(
            flatTimeCells,
            date
          )
        : (getOffset as (date: Date) => number)(date),
    [selectedRange, getOffset, flatTimeCells]
  );

  const getDurationForView = useCallback(
    (start: Date, end: Date) =>
      selectedRange === 'quarter'
        ? (getDuration as (cells: Date[], s: Date, e: Date) => number)(
            flatTimeCells,
            start,
            end
          )
        : (getDuration as (s: Date, e: Date) => number)(start, end),
    [selectedRange, getDuration, flatTimeCells]
  );

  const todayOffset = useMemo(() => {
    if (!showTodayLine) return undefined;
    let offset = getOffsetForView(today);
    if (selectedRange === 'month') offset += 0.5;
    return offset;
  }, [getOffsetForView, showTodayLine, today, selectedRange]);

  // preserve scroll position when we prepend months
  useLayoutEffect(() => {
    const element = timelineBodyRef.current;
    if (element && scrollState.current.scrollWidth > 0) {
      const newWidth = element.scrollWidth;
      const difference = newWidth - scrollState.current.scrollWidth;
      element.scrollLeft = scrollState.current.scrollLeft + difference;
      scrollState.current.scrollWidth = 0;
    }
  }, [timelineStartDate]);

  // infinite scroll handler
  const onTimelineScroll = useCallback(() => {
    const timelineElement = timelineBodyRef.current;
    if (!timelineElement || isLoading) return;
    const { scrollLeft, scrollWidth, clientWidth } = timelineElement;

    // update visible label
    let cumulativeWidth = 0;
    for (const group of timeGroups) {
      cumulativeWidth += group.totalWidth;
      if (cumulativeWidth >= scrollLeft) {
        if (group.label !== visibleLabel) setVisibleLabel(group.label);
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
      setTimelineStartDate((prev) => subMonths(prev, 3));
      setTimeout(() => setIsLoading(false), 50);
    }
  }, [isLoading, timeGroups, visibleLabel]);

  const scrollToToday = useCallback(() => {
    const timelineElement = timelineBodyRef.current;
    if (!timelineElement || todayOffset === undefined) return;
    // Center today in view
    const position = todayOffset * unitWidth - timelineElement.clientWidth / 2;
    timelineElement.scrollTo({ left: position, behavior: 'auto' });
  }, [todayOffset, unitWidth]);

  // Mount-only scroll: waits until timeGroups to exist, then fires once
  useEffect(() => {
    if (didInitialScroll.current || timeGroups.length === 0) return;
    const element = timelineBodyRef.current;
    if (!element) return;

    didInitialScroll.current = true;
    // wait a paint for layout
    requestAnimationFrame(() => {
      scrollToToday();
    });
  }, [scrollToToday, timeGroups.length]);

  // Scroll when the user switches range
  useEffect(() => {
    if (!rangeChanged.current) return;
    const timer = setTimeout(() => {
      scrollToToday();
      rangeChanged.current = false;
    }, 100);
    return () => clearTimeout(timer);
  }, [timelineStartDate, endDate, scrollToToday]);

  const handleRangeChange = (range: TimeRangeOption) => {
    rangeChanged.current = true;
    setSelectedRange(range);
    const { startDate, endDate } = getTimeRangeDates(range, today);
    setTimelineStartDate(startDate);
    setEndDate(endDate);
  };

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

      <Box display="flex" position="relative">
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
                  left: `${todayOffset * unitWidth - 1}px`,
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
              viewBounds={{ left: timelineStartDate, right: endDate }}
              getOffset={getOffsetForView}
              getDuration={getDurationForView}
              unitWidth={unitWidth}
              renderItemTooltip={renderItemTooltip}
            />
          </Box>
        </Box>

        {visibleLabel && (
          <Box position="absolute" top="4px" left={`${leftColumnWidth}px`}>
            <Box bg={colors.background} px="16px" py="4px">
              <Text m="0" variant="bodyM">
                {visibleLabel}
              </Text>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default GanttChart;
