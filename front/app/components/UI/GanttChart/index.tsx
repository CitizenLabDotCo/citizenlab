import React, { useRef, useState, useLayoutEffect } from 'react';

import { Box, Tooltip, colors } from '@citizenlab/cl2-component-library';
import { addDays, addMonths, subMonths } from 'date-fns';

import { TimeRangeSelector } from './TimeRangeSelector';
import {
  daysBetween,
  getMonthMeta,
  getTimeRangeDates,
  scrollToToday,
  TimeRangeOption,
} from './utils';

export type GanttItem = {
  id: string;
  title: string;
  start: string | null;
  end: string | null;
};

export type GanttChartProps = {
  chartTitle?: string;
  items: GanttItem[];
  startDate?: Date;
  endDate?: Date;
  leftColumnWidth?: number;
  dayWidth?: number;
  rowHeight?: number;
  timelineHeight?: number;
  onItemClick?: (item: GanttItem) => void;
  renderItemTooltip?: (item: GanttItem) => React.ReactNode;
  renderItemLabel?: (item: GanttItem) => React.ReactNode;
  getItemColor?: (item: GanttItem) => string;
  showTodayLine?: boolean;
  showDays?: boolean;
  showMonths?: boolean;
  height?: string;
};

export const GanttChart = ({
  items,
  chartTitle,
  startDate: initialStartDate,
  endDate: initialEndDate,
  leftColumnWidth = 260,
  dayWidth = 40,
  rowHeight = 40,
  timelineHeight = 40,
  onItemClick,
  renderItemTooltip,
  renderItemLabel,
  getItemColor = () => colors.white,
  showTodayLine = true,
  showDays = true,
  showMonths = true,
}: GanttChartProps) => {
  const today = new Date();
  const [selectedRange, setSelectedRange] = useState<TimeRangeOption>('year');
  const [startDate, setStartDate] = useState<Date>(
    initialStartDate || subMonths(today, 6)
  );
  const [endDate, setEndDate] = useState<Date>(
    initialEndDate || addMonths(today, 6)
  );
  const [isLoading, setIsLoading] = useState(false);
  const scrollState = useRef({
    scrollLeft: 0,
    scrollWidth: 0,
  });

  const months = getMonthMeta(startDate, endDate);
  const [visibleMonthLabel, setVisibleMonthLabel] = useState(
    months.length > 0 ? months[0].label : ''
  );
  const totalDays = daysBetween(startDate, endDate);
  const todayOffset = daysBetween(startDate, today);

  const timelineHeaderRef = useRef<HTMLDivElement>(null);
  const timelineBodyRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (timelineBodyRef.current && scrollState.current.scrollWidth) {
      const newScrollWidth = timelineBodyRef.current.scrollWidth;
      const widthAdded = newScrollWidth - scrollState.current.scrollWidth;
      timelineBodyRef.current.scrollLeft =
        scrollState.current.scrollLeft + widthAdded;
    }
    scrollState.current.scrollWidth = 0;
  }, [startDate]);

  const onTimelineScroll = () => {
    if (!timelineBodyRef.current || isLoading) return;

    if (timelineHeaderRef.current) {
      timelineHeaderRef.current.scrollLeft = timelineBodyRef.current.scrollLeft;
    }

    let currentLabel = '';
    for (let i = months.length - 1; i >= 0; i--) {
      const month = months[i];
      const monthStartPx = month.offsetDays * dayWidth;
      if (timelineBodyRef.current.scrollLeft >= monthStartPx) {
        currentLabel = month.label;
        break;
      }
    }
    if (currentLabel && currentLabel !== visibleMonthLabel) {
      setVisibleMonthLabel(currentLabel);
    }

    const { scrollLeft, scrollWidth, clientWidth } = timelineBodyRef.current;
    const scrollBuffer = 800;

    if (scrollLeft + clientWidth >= scrollWidth - scrollBuffer) {
      setIsLoading(true);
      setEndDate((prev) => addMonths(prev, 3));
      setTimeout(() => setIsLoading(false), 50);
    }

    if (scrollLeft <= scrollBuffer) {
      setIsLoading(true);
      scrollState.current = {
        scrollLeft: timelineBodyRef.current.scrollLeft,
        scrollWidth: timelineBodyRef.current.scrollWidth,
      };
      setStartDate((prev) => subMonths(prev, 3));
      setTimeout(() => setIsLoading(false), 50);
    }
  };

  const handleRangeChange = (range: TimeRangeOption) => {
    setSelectedRange(range);
    const { startDate: newStartDate, endDate: newEndDate } = getTimeRangeDates(
      range,
      today
    );
    setStartDate(newStartDate);
    setEndDate(newEndDate);
    if (timelineBodyRef.current) {
      timelineBodyRef.current.scrollLeft = 0;
    }
  };

  const handleTodayClick = () => {
    scrollToToday(timelineBodyRef, todayOffset, dayWidth);
  };

  return (
    <Box
      bg="#fff"
      borderRadius="8px"
      overflow="hidden"
      border="1px solid #e0e0e0"
      p="24px"
    >
      <Box
        display="flex"
        justifyContent="flex-end"
        mb="8px"
        position="relative"
        zIndex="4"
      >
        <TimeRangeSelector
          selectedRange={selectedRange}
          onRangeChange={handleRangeChange}
          onTodayClick={handleTodayClick}
        />
      </Box>

      {/* Header row */}
      <Box
        display="flex"
        position="relative"
        zIndex="2"
        boxShadow="0 1px 0 #e0e0e0"
      >
        {/* Left column header */}
        <Box
          width={`${leftColumnWidth}px`}
          minWidth={`${leftColumnWidth}px`}
          maxWidth={`${leftColumnWidth}px`}
          style={{ position: 'sticky', left: 0, zIndex: 3 }}
          display="flex"
          alignItems="center"
          height={`${timelineHeight * 2}px`}
          pl="16px"
          bg="#fff"
        >
          {chartTitle}
        </Box>
        <Box flex="1" overflow="hidden" position="relative">
          <Box
            position="absolute"
            top="0"
            left="0"
            height={`${timelineHeight}px`}
            display="flex"
            alignItems="center"
            justifyContent="center"
            zIndex="2"
            pl="16px"
            pr="16px"
            bg="#fafbfc"
            style={{
              fontWeight: 800,
              fontSize: '18px',
              color: '#222',
              letterSpacing: '0.5px',
            }}
          >
            {visibleMonthLabel}
          </Box>

          <Box ref={timelineHeaderRef} style={{ overflow: 'hidden' }}>
            {/* Months row */}
            {showMonths && (
              <Box
                display="flex"
                height={`${timelineHeight}px`}
                position="relative"
                style={{
                  overflow: 'hidden',
                  minWidth: `${totalDays * dayWidth}px`,
                  background: '#fafbfc',
                }}
              >
                {months.map((month) => (
                  <Box
                    key={month.label}
                    minWidth={`${month.daysInMonth * dayWidth}px`}
                    width={`${month.daysInMonth * dayWidth}px`}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    style={{
                      color: 'transparent',
                    }}
                  >
                    {month.label}
                  </Box>
                ))}
                {months.map((_, i) => {
                  if (i === 0) return null;
                  const month = months[i];
                  const lineLeftPosition =
                    month.offsetDays * dayWidth + dayWidth / 2 - 0.5;
                  return (
                    <Box
                      key={`month-line-${i}`}
                      position="absolute"
                      left={`${lineLeftPosition}px`}
                      top="0"
                      width="1px"
                      height="100%"
                      bg="#e0e0e0"
                    />
                  );
                })}
              </Box>
            )}

            {/* Days row */}
            {showDays && (
              <Box
                display="flex"
                height={`${timelineHeight}px`}
                borderBottom="1px solid #e0e0e0"
                style={{
                  overflow: 'hidden',
                  minWidth: `${totalDays * dayWidth}px`,
                  background: '#fafbfc',
                }}
              >
                {Array.from({ length: totalDays }).map((_, idx) => {
                  const day = addDays(startDate, idx);
                  return (
                    <Box
                      key={`day-${idx}`}
                      minWidth={`${dayWidth}px`}
                      width={`${dayWidth}px`}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      style={{ color: '#888', fontSize: '12px' }}
                    >
                      {day.getDate()}
                    </Box>
                  );
                })}
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {/* Body */}
      <Box display="flex" position="relative" height="100%">
        {/* Left column */}
        <Box
          width={`${leftColumnWidth}px`}
          bg="#fff"
          style={{
            position: 'sticky',
            left: 0,
            zIndex: 2,
            borderRight: '1px solid #e0e0e0',
          }}
        >
          {items.map((item) => (
            <Box
              key={item.id}
              height={`${rowHeight}px`}
              display="flex"
              alignItems="center"
              pl="16px"
              pr="8px"
              borderBottom="1px solid #e0e0e0"
              style={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {renderItemLabel ? renderItemLabel(item) : item.title}
            </Box>
          ))}
        </Box>

        {/* Timeline body */}
        <Box
          flex="1"
          overflow="auto"
          ref={timelineBodyRef}
          onScroll={onTimelineScroll}
          bgColor={colors.background}
          position="relative"
        >
          <Box position="relative" minWidth={`${totalDays * dayWidth}px`}>
            {/* Centered grid lines */}
            <Box
              position="absolute"
              top="0"
              left="0"
              width="100%"
              height="100%"
              zIndex="0"
            >
              {Array.from({ length: totalDays }).map((_, i) => (
                <Box
                  key={`grid-line-${i}`}
                  position="absolute"
                  left={`${i * dayWidth + dayWidth / 2 - 0.5}px`}
                  top="0"
                  width="1px"
                  height="100%"
                  bg="#e0e0e0"
                />
              ))}
            </Box>

            {/* Today line */}
            {showTodayLine && todayOffset >= 0 && todayOffset < totalDays && (
              <Box
                position="absolute"
                top="0"
                left={`${(todayOffset - 1) * dayWidth + dayWidth / 2 - 1}px`}
                width="2px"
                height="100%"
                bg={colors.primary}
                style={{ zIndex: 2, pointerEvents: 'none' }}
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

            {/* Items container */}
            <Box position="relative" height={`${items.length * rowHeight}px`}>
              {items.map((item, index) => {
                const start = item.start ? new Date(item.start) : undefined;
                // --- CHANGE 1: Allow for a null end date ---
                const end = item.end ? new Date(item.end) : null;

                // Only skip if there's no start date
                if (!start) return null;

                const effectiveStart =
                  start.getTime() > startDate.getTime() ? start : startDate;

                // --- CHANGE 2: Calculate the effectiveEnd based on whether end is null ---
                const effectiveEnd =
                  end === null
                    ? endDate // If no end date, the bar goes to the edge of the chart
                    : end.getTime() < endDate.getTime()
                    ? end
                    : endDate;

                if (
                  effectiveStart.getTime() > endDate.getTime() ||
                  (end !== null && end.getTime() < startDate.getTime())
                ) {
                  return null;
                }

                const startOffset = daysBetween(startDate, effectiveStart) - 1;
                const duration = daysBetween(effectiveStart, effectiveEnd);

                if (duration <= 0) return null;

                return (
                  <Box
                    key={item.id}
                    position="absolute"
                    top={`${index * rowHeight + 4}px`}
                    left={`${startOffset * dayWidth}px`}
                    width={`${duration * dayWidth}px`}
                    height={`${rowHeight - 8}px`}
                    background={getItemColor(item)}
                    borderColor={colors.grey300}
                    border="1px solid"
                    borderRadius="4px"
                    style={{
                      cursor: onItemClick ? 'pointer' : 'default',
                      zIndex: 1,
                    }}
                    onClick={() => onItemClick?.(item)}
                  >
                    {renderItemTooltip && (
                      <Tooltip content={renderItemTooltip(item)}>
                        <Box width="100%" height="100%" />
                      </Tooltip>
                    )}
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
