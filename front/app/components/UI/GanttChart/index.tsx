import React, { useRef } from 'react';

import { Box, Tooltip, colors } from '@citizenlab/cl2-component-library';

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
  startDate = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
  endDate = new Date(new Date().getFullYear(), new Date().getMonth() + 2, 0),
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
  const months = getMonthMeta(startDate, endDate);

  const daysBetween = (a: Date, b: Date) =>
    Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
  const totalDays = daysBetween(startDate, endDate);
  const todayOffset = daysBetween(startDate, today);

  const timelineHeaderRef = useRef<HTMLDivElement>(null);
  const timelineBodyRef = useRef<HTMLDivElement>(null);

  const onTimelineScroll = () => {
    if (timelineHeaderRef.current && timelineBodyRef.current) {
      timelineHeaderRef.current.scrollLeft = timelineBodyRef.current.scrollLeft;
    }
  };

  return (
    <Box
      bg="#fff"
      borderRadius="8px"
      overflow="hidden"
      border="1px solid #e0e0e0"
      p="24px"
    >
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
            fontWeight: 700,
          }}
          display="flex"
          alignItems="center"
          height={`${timelineHeight * 2}px`}
          pl="16px"
        >
          {chartTitle}
        </Box>

        {/* Timeline header */}
        <Box flex="1" overflow="hidden">
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
          {items.map((item) => (
            <Box
              key={item.id}
              height={`${rowHeight}px`}
              display="flex"
              alignItems="center"
              pl="16px"
              pr="8px"
              style={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                color: '#222',
                fontWeight: 500,
                borderBottom: '1px solid #e0e0e0',
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
        >
          <Box
            minWidth={`${totalDays * dayWidth}px`}
            position="relative"
            style={{
              background: `repeating-linear-gradient(
                 to bottom,
                 #fff,
                 #fff ${rowHeight - 1}px,
                 #e0e0e0 ${rowHeight - 1}px,
                 #e0e0e0 ${rowHeight}px
               )`,
            }}
          >
            {items.map((item, index) => {
              const start = item.start ? new Date(item.start) : undefined;
              const end = item.end ? new Date(item.end) : undefined;
              const startOffset = start
                ? daysBetween(startDate, start)
                : undefined;
              const duration =
                start && end ? daysBetween(start, end) : undefined;

              return (
                <Box
                  key={item.id}
                  position="absolute"
                  top={`${index * rowHeight}px`}
                  left={startOffset ? `${startOffset * dayWidth}px` : '0'}
                  width={duration ? `${duration * dayWidth}px` : '0'}
                  height={`${rowHeight - 8}px`}
                  margin="2px 0"
                  background={getItemColor(item)}
                  borderColor={colors.grey300}
                  border="1px solid"
                  borderRadius="4px"
                  style={{
                    cursor: onItemClick ? 'pointer' : 'default',
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

            {/* Today line */}
            {showTodayLine && (
              <Box
                position="absolute"
                top="0"
                left={`${todayOffset * dayWidth}px`}
                width="2px"
                height="100%"
                bg="red"
                style={{ zIndex: 1 }}
              />
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
