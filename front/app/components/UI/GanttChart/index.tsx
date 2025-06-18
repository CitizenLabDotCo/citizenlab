import React, { useRef, useState } from 'react';

import { Box, Tooltip, colors } from '@citizenlab/cl2-component-library';

import { TimeRangeSelector } from './TimeRangeSelector';
import {
  daysBetween,
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

function getMonthMeta(start: Date, end: Date) {
  const months: {
    label: string;
    monthStart: Date;
    daysInMonth: number;
    offsetDays: number;
  }[] = [];
  let current = new Date(start.getFullYear(), start.getMonth(), 1);
  while (current <= end) {
    const year = current.getFullYear();
    const monthIndex = current.getMonth();
    const monthStart = new Date(year, monthIndex, 1);
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const offsetDays = Math.max(
      0,
      Math.round(
        (monthStart.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
      )
    );
    months.push({
      label: monthStart.toLocaleString('default', {
        month: 'long',
        year: 'numeric',
      }),
      monthStart,
      daysInMonth,
      offsetDays,
    });
    current = new Date(year, monthIndex + 1, 1);
  }
  return months;
}

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
  const [selectedRange, setSelectedRange] = useState<TimeRangeOption>('month');
  const [startDate, setStartDate] = useState<Date>(
    initialStartDate || getTimeRangeDates('month', today).startDate
  );
  const [endDate, setEndDate] = useState<Date>(
    initialEndDate || getTimeRangeDates('month', today).endDate
  );

  const months = getMonthMeta(startDate, endDate);

  const totalDays = daysBetween(startDate, endDate);
  const todayOffset = daysBetween(startDate, today);

  const timelineHeaderRef = useRef<HTMLDivElement>(null);
  const timelineBodyRef = useRef<HTMLDivElement>(null);

  const onTimelineScroll = () => {
    if (timelineHeaderRef.current && timelineBodyRef.current) {
      timelineHeaderRef.current.scrollLeft = timelineBodyRef.current.scrollLeft;
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
          style={{
            position: 'sticky',
            left: 0,
            zIndex: 3,
            borderRight: '1px solid #e0e0e0',
          }}
          display="flex"
          alignItems="center"
          height={`${timelineHeight * 2}px`}
          pl="16px"
        >
          {chartTitle}
        </Box>

        {/* Timeline header */}
        <Box flex="1" overflow="hidden" position="relative">
          <Box ref={timelineHeaderRef} style={{ overflow: 'hidden' }}>
            {/* Months row */}
            {showMonths && (
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
                {months.map((month, i) => (
                  <Box
                    key={month.label}
                    minWidth={`${month.daysInMonth * dayWidth}px`}
                    width={`${month.daysInMonth * dayWidth}px`}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    style={{
                      fontWeight: 800,
                      color: '#222',
                      borderRight:
                        i === months.length - 1
                          ? undefined
                          : '1px solid #e0e0e0',
                      fontSize: '18px',
                      height: '100%',
                      boxSizing: 'border-box',
                      letterSpacing: '0.5px',
                    }}
                  >
                    {month.label}
                  </Box>
                ))}
              </Box>
            )}

            {/* Days row */}
            {showDays && (
              <Box
                display="flex"
                height={`${timelineHeight}px`}
                style={{
                  overflow: 'hidden',
                  minWidth: `${totalDays * dayWidth}px`,
                  background: '#fafbfc',
                }}
              >
                {months.map((month) =>
                  Array.from({ length: month.daysInMonth }).map((_, idx) => (
                    <Box
                      key={`${month.label}-${idx + 1}`}
                      minWidth={`${dayWidth}px`}
                      width={`${dayWidth}px`}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      style={{
                        color: '#888',
                        fontSize: '12px',
                        borderRight: '1px solid #e0e0e0',
                        borderBottom: '1px solid #e0e0e0',
                        height: '100%',
                        boxSizing: 'border-box',
                      }}
                    >
                      {idx + 1}
                    </Box>
                  ))
                )}
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
          minWidth={`${leftColumnWidth}px`}
          maxWidth={`${leftColumnWidth}px`}
          bg="#fff"
          style={{
            position: 'sticky',
            left: 0,
            zIndex: 2,
            borderRight: '1px solid #e0e0e0',
          }}
        >
          {items.map((item, index) => (
            <Box
              key={item.id}
              height={`${rowHeight}px`}
              display="flex"
              alignItems="center"
              pl="16px"
              pr="8px"
              borderBottom="1px solid #e0e0e0"
              borderTop={index === 0 ? '1px solid #e0e0e0' : undefined}
              style={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                color: '#222',
                fontWeight: 500,
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
          <Box
            position="absolute"
            top="0"
            left="0"
            width={`${totalDays * dayWidth}px`}
            height="100%"
            display="flex"
            zIndex="0"
          >
            {Array.from({ length: totalDays }).map((_, i) => (
              <Box
                key={`grid-line-${i}`}
                width={`${dayWidth}px`}
                height="100%"
                borderRight="1px solid #e0e0e0"
                style={{
                  boxSizing: 'border-box',
                }}
              />
            ))}
          </Box>

          {/* Today line */}
          {showTodayLine && todayOffset >= 0 && todayOffset <= totalDays && (
            <Box
              position="absolute"
              top="0"
              left={`${todayOffset * dayWidth - dayWidth / 2}px`}
              width="2px"
              height="100%"
              bg={colors.primary}
              style={{
                zIndex: 2,
                pointerEvents: 'none',
              }}
            >
              <Box
                position="absolute"
                top="0"
                left="-4px"
                width="10px"
                height="10px"
                borderRadius="50%"
                bg={colors.primary}
              />
            </Box>
          )}

          {/* Inner box for content and background */}
          <Box
            minWidth={`${totalDays * dayWidth}px`}
            position="relative"
            height={`${items.length * rowHeight}px`}
          >
            {/* Items */}
            {items.map((item, index) => {
              const start = item.start ? new Date(item.start) : undefined;
              const end = item.end ? new Date(item.end) : undefined;

              // Determine the effective start and end dates for display
              const effectiveStart = start
                ? Math.max(start.getTime(), startDate.getTime())
                : startDate.getTime();
              const effectiveEnd = end
                ? Math.min(end.getTime(), endDate.getTime())
                : endDate.getTime();

              // If the item starts after the chart ends, or ends before the chart starts, don't render
              if (
                effectiveStart > endDate.getTime() ||
                effectiveEnd < startDate.getTime()
              ) {
                return null;
              }

              // Calculate the offset from the chart's start date to the item's effective start date
              const startOffset = daysBetween(
                startDate,
                new Date(effectiveStart)
              );
              // Calculate the duration based on the effective start and end dates
              const duration = daysBetween(
                new Date(effectiveStart),
                new Date(effectiveEnd)
              );

              if (duration <= 0) return null; // Don't render items with zero or negative duration

              return (
                <Box
                  key={item.id}
                  position="absolute"
                  top={`${index * rowHeight}px`}
                  left={`${startOffset * dayWidth}px`}
                  width={`${duration * dayWidth}px`}
                  height={`${rowHeight - 8}px`}
                  margin="2px 0"
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
  );
};
