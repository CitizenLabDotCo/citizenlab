import React, {
  useRef,
  useState,
  useLayoutEffect,
  useCallback,
  useMemo,
} from 'react';

import { Box, Tooltip, colors } from '@citizenlab/cl2-component-library';
import { addDays, addMonths, subMonths } from 'date-fns';

import TimeRangeSelector from './TimeRangeSelector';
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
  getLabelFromScroll,
} from './utils';

export const GanttChart = ({
  items,
  chartTitle,
  startDate: initialStartDate,
  endDate: initialEndDate,
  leftColumnWidth = 260,
  dayWidth = 40,
  monthWidth = 50,
  rowHeight = 40,
  timelineHeight = 40,
  onItemClick,
  renderItemTooltip,
  renderItemLabel,
  getItemColor = () => colors.white,
  showTodayLine = true,
}: GanttChartProps) => {
  const today = new Date();
  const [selectedRange, setSelectedRange] = useState<TimeRangeOption>('year');
  const isYearlyView = selectedRange === '5years';

  const { startDate: initialStart, endDate: initialEnd } = getTimeRangeDates(
    selectedRange,
    today
  );

  const [startDate, setStartDate] = useState<Date>(
    initialStartDate || initialStart
  );
  const [endDate, setEndDate] = useState<Date>(initialEndDate || initialEnd);
  const [isLoading, setIsLoading] = useState(false);

  const timelineHeaderRef = useRef<HTMLDivElement>(null);
  const timelineBodyRef = useRef<HTMLDivElement>(null);
  const scrollState = useRef({ scrollLeft: 0, scrollWidth: 0 });

  const dailyViewData = useMemo(() => {
    if (isYearlyView) return null;
    const totalDays = getDurationInDays(startDate, endDate);
    return {
      months: getMonthMeta(startDate, endDate),
      totalDays,
      todayOffset: getOffsetInDays(startDate, today),
    };
  }, [isYearlyView, startDate, endDate, today]);

  const yearlyViewData = useMemo(() => {
    if (!isYearlyView) return null;
    return {
      years: getYearMeta(startDate, endDate),
      totalMonths: getDurationInMonths(startDate, endDate),
      todayOffset: getOffsetInMonths(startDate, today),
    };
  }, [isYearlyView, startDate, endDate, today]);

  const [visibleLabel, setVisibleLabel] = useState<string>('');

  useLayoutEffect(() => {
    setVisibleLabel(
      isYearlyView
        ? yearlyViewData?.years[0]?.label ?? ''
        : dailyViewData?.months[0]?.label ?? ''
    );
  }, [selectedRange, yearlyViewData, dailyViewData, isYearlyView]);

  useLayoutEffect(() => {
    if (!timelineBodyRef.current) return;
    const newLabel = getLabelFromScroll(
      timelineBodyRef.current.scrollLeft,
      isYearlyView,
      dailyViewData,
      yearlyViewData,
      dayWidth,
      monthWidth
    );
    if (newLabel) setVisibleLabel(newLabel);
  }, [
    startDate,
    endDate,
    isYearlyView,
    dailyViewData,
    yearlyViewData,
    dayWidth,
    monthWidth,
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

    const newLabel = getLabelFromScroll(
      scrollLeft,
      isYearlyView,
      dailyViewData,
      yearlyViewData,
      dayWidth,
      monthWidth
    );
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
    isYearlyView,
    dailyViewData,
    yearlyViewData,
    dayWidth,
    monthWidth,
    visibleLabel,
    isLoading,
  ]);

  const handleRangeChange = (range: TimeRangeOption) => {
    setSelectedRange(range);
    const { startDate: newStart, endDate: newEnd } = getTimeRangeDates(
      range,
      today
    );
    setStartDate(newStart);
    setEndDate(newEnd);
    if (timelineBodyRef.current) {
      timelineBodyRef.current.scrollLeft = 0;
    }
  };

  const handleTodayClick = () => {
    const offset = isYearlyView
      ? yearlyViewData?.todayOffset
      : dailyViewData?.todayOffset;
    const unitWidth = isYearlyView ? monthWidth : dayWidth;
    if (offset !== undefined) {
      scrollTo(timelineBodyRef, offset, unitWidth);
    }
  };

  const unitW = isYearlyView ? monthWidth : dayWidth;
  const totalSize = isYearlyView
    ? (yearlyViewData?.totalMonths || 0) * unitW
    : (dailyViewData?.totalDays || 0) * unitW;
  const todayOffset = isYearlyView
    ? yearlyViewData?.todayOffset
    : dailyViewData?.todayOffset;

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

          <Box ref={timelineHeaderRef} overflow="hidden">
            {isYearlyView && yearlyViewData ? (
              <Box minWidth={`${totalSize}px`} bg="#fafbfc">
                <Box display="flex" height={`${timelineHeight}px`}>
                  {yearlyViewData.years.map((y) => (
                    <Box
                      key={y.label}
                      minWidth={`${y.monthsInYear * monthWidth}px`}
                      width={`${y.monthsInYear * monthWidth}px`}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      borderLeft={`1px solid ${colors.grey300}`}
                      style={{ color: 'transparent' }}
                    >
                      {y.label}
                    </Box>
                  ))}
                </Box>
                <Box
                  display="flex"
                  height={`${timelineHeight}px`}
                  borderTop={`1px solid ${colors.grey300}`}
                >
                  {yearlyViewData.years.flatMap((y) =>
                    Array.from({ length: 12 }).map((_, i) => (
                      <Box
                        key={`${y.label}-${i}`}
                        minWidth={`${monthWidth}px`}
                        width={`${monthWidth}px`}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        style={{ color: '#888', fontSize: '12px' }}
                      >
                        {i + 1}
                      </Box>
                    ))
                  )}
                </Box>
              </Box>
            ) : (
              <Box minWidth={`${totalSize}px`} bg="#fafbfc">
                <Box display="flex" height={`${timelineHeight}px`}>
                  {dailyViewData?.months.map((m) => (
                    <Box
                      key={m.label}
                      minWidth={`${m.daysInMonth * dayWidth}px`}
                      width={`${m.daysInMonth * dayWidth}px`}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      borderLeft={`1px solid ${colors.grey300}`}
                      style={{ color: 'transparent' }}
                    >
                      {m.label}
                    </Box>
                  ))}
                </Box>
                <Box
                  display="flex"
                  height={`${timelineHeight}px`}
                  borderTop={`1px solid ${colors.grey300}`}
                >
                  {Array.from({ length: dailyViewData?.totalDays || 0 }).map(
                    (_, i) => (
                      <Box
                        key={`day-${i}`}
                        minWidth={`${dayWidth}px`}
                        width={`${dayWidth}px`}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        style={{ color: '#888', fontSize: '12px' }}
                      >
                        {addDays(startDate, i).getDate()}
                      </Box>
                    )
                  )}
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      <Box display="flex">
        <Box
          width={`${leftColumnWidth}px`}
          position="sticky"
          borderRight={`1px solid ${colors.grey300}`}
          bg={colors.white}
          style={{ left: 0, zIndex: 2 }}
        >
          {items.map((item) => (
            <Box
              key={item.id}
              height={`${rowHeight}px`}
              display="flex"
              alignItems="center"
              pl="16px"
              pr="8px"
              borderBottom={`1px solid ${colors.grey300}`}
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

        <Box
          flex="1"
          overflow="auto"
          ref={timelineBodyRef}
          onScroll={onTimelineScroll}
          bgColor={colors.background}
          position="relative"
        >
          <Box position="relative" minWidth={`${totalSize}px`}>
            <Box position="absolute" width="100%" height="100%">
              {Array.from({
                length: isYearlyView
                  ? yearlyViewData?.totalMonths || 0
                  : dailyViewData?.totalDays || 0,
              }).map((_, i) => (
                <Box
                  key={`grid-${i}`}
                  position="absolute"
                  left={`${i * unitW + unitW / 2 - 0.5}px`}
                  width="1px"
                  height="100%"
                  bg={colors.divider}
                />
              ))}
            </Box>

            {showTodayLine && todayOffset !== undefined && (
              <Box
                position="absolute"
                width="2px"
                height="100%"
                bg={colors.primary}
                style={{
                  left: `${todayOffset * unitW + unitW / 2 - 1}px`,
                  pointerEvents: 'none',
                  zIndex: 1,
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

            <Box position="relative" height={`${items.length * rowHeight}px`}>
              {items.map((item, index) => {
                const s = item.start ? new Date(item.start) : undefined;
                if (!s) return null;
                const e = item.end ? new Date(item.end) : null;

                const effectiveStart = s > startDate ? s : startDate;
                const effectiveEnd =
                  e === null ? endDate : e < endDate ? e : endDate;
                if (effectiveStart >= effectiveEnd) return null;

                const startOffset = isYearlyView
                  ? getOffsetInMonths(startDate, effectiveStart)
                  : getOffsetInDays(startDate, effectiveStart);

                const duration = isYearlyView
                  ? getDurationInMonths(effectiveStart, effectiveEnd)
                  : getDurationInDays(effectiveStart, effectiveEnd);
                if (duration <= 0) return null;

                return (
                  <Box
                    key={item.id}
                    position="absolute"
                    top={`${index * rowHeight + 4}px`}
                    left={`${startOffset * unitW}px`}
                    width={`${duration * unitW}px`}
                    height={`${rowHeight - 8}px`}
                    background={getItemColor(item)}
                    border="1px solid"
                    borderColor={colors.grey300}
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
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default GanttChart;
