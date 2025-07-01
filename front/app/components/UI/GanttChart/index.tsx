import React, {
  useRef,
  useState,
  useLayoutEffect,
  useEffect,
  useCallback,
  useMemo,
} from 'react';

import { Box, Tooltip, colors } from '@citizenlab/cl2-component-library';
import { addDays, addMonths, subMonths, max, min } from 'date-fns';

import GanttItemIconBar from './GanttItemIconBar';
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
  getQuarterCellsMeta,
  getOffsetInQuarterCells,
  getDurationInQuarterCells,
  getWeekMeta,
  getOffsetInWeeks,
  getDurationInWeeks,
} from './utils';

const quarterWidth = 48;
const weekWidth = 48;

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
    dayWidth,
    monthWidth,
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
            {isMultiYearView ? (
              <Box>
                <Box display="flex" height={`${timelineHeight}px`} w="0px">
                  {yearMeta.map((y) => (
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
                      <Box
                        display="flex"
                        height={`${timelineHeight}px`}
                        w="0px"
                      >
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
                      <Box
                        display="flex"
                        height={`${timelineHeight}px`}
                        w="0px"
                      >
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
                cursor: onItemLabelClick ? 'pointer' : 'default',
              }}
              onClick={
                onItemLabelClick ? () => onItemLabelClick(item) : undefined
              }
            >
              <GanttItemIconBar
                color={item.color}
                icon={item.icon}
                rowHeight={rowHeight}
                mr="8px"
              />
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
          <Box position="relative">
            <Box position="absolute" width="100%" height="100%">
              {Array.from({
                length: isMultiYearView
                  ? getDurationInMonths(startDate, endDate)
                  : isYearView
                  ? weekCells.length
                  : isQuarterView
                  ? quarterCells.length
                  : getDurationInDays(startDate, endDate),
              }).map((_, i) => (
                <Box
                  key={`grid-line-${i}`}
                  position="absolute"
                  left={`${i * unitW - 0.5}px`}
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

                const startOffset = getOffset(effectiveStart);
                const duration = getDuration(effectiveStart, effectiveEnd);
                if (duration <= 0) return null;

                let highlightEl: JSX.Element | null = null;
                let textInHighlight = false;

                const highlightStart = item.highlightStartDate
                  ? new Date(item.highlightStartDate)
                  : null;

                if (highlightStart) {
                  const highlightEnd = item.highlightEndDate
                    ? new Date(item.highlightEndDate)
                    : null;

                  const logicalHighlightStart = max([s, highlightStart]);
                  const highlightCap = e || endDate;
                  const logicalHighlightEnd = highlightEnd
                    ? min([highlightEnd, highlightCap])
                    : highlightCap;

                  const vizHighlightStart = max([
                    effectiveStart,
                    logicalHighlightStart,
                  ]);
                  const vizHighlightEnd = min([
                    effectiveEnd,
                    logicalHighlightEnd,
                  ]);

                  if (vizHighlightStart < vizHighlightEnd) {
                    textInHighlight =
                      vizHighlightStart.getTime() === effectiveStart.getTime();

                    const highlightOffset = getOffset(vizHighlightStart);
                    const highlightDuration = getDuration(
                      vizHighlightStart,
                      vizHighlightEnd
                    );

                    if (highlightDuration > 0) {
                      highlightEl = (
                        <Box
                          position="absolute"
                          top={`${index * rowHeight + 4}px`}
                          left={`${highlightOffset * unitW}px`}
                          width={`${highlightDuration * unitW}px`}
                          height={`${rowHeight - 8}px`}
                          bg={colors.teal50}
                          border={`1px solid ${colors.teal400}`}
                          display="flex"
                          alignItems="center"
                          overflow="hidden"
                          style={{
                            pointerEvents: 'none',
                            zIndex: 1,
                          }}
                        >
                          {textInHighlight && (
                            <Box
                              display="flex"
                              alignItems="center"
                              as="span"
                              px="4px"
                              style={{
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                color: colors.grey800,
                                fontWeight: 500,
                              }}
                            >
                              <GanttItemIconBar
                                color={item.color}
                                icon={item.icon}
                                rowHeight={rowHeight}
                                mr="8px"
                                ml="0px"
                              />
                              {item.title}
                            </Box>
                          )}
                        </Box>
                      );
                    }
                  }
                }

                const textLabel = (
                  <Box
                    as="span"
                    px="4px"
                    style={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      color: colors.grey800,
                      fontWeight: 500,
                      pointerEvents: 'none',
                    }}
                  >
                    {item.title}
                  </Box>
                );

                return (
                  <React.Fragment key={item.id}>
                    <Box
                      position="absolute"
                      top={`${index * rowHeight + 4}px`}
                      left={`${startOffset * unitW}px`}
                      width={`${duration * unitW}px`}
                      height={`${rowHeight - 8}px`}
                      background={getItemColor(item)}
                      border="1px solid"
                      borderColor={colors.grey300}
                      borderRadius="4px"
                      display="flex"
                      alignItems="center"
                      overflow="hidden"
                      style={{
                        cursor: onItemClick ? 'pointer' : 'default',
                      }}
                      onClick={() => onItemClick?.(item)}
                    >
                      <GanttItemIconBar
                        color={item.color}
                        icon={item.icon}
                        rowHeight={rowHeight}
                        mr="0px"
                        ml="4px"
                      />
                      {!textInHighlight && textLabel}
                      {renderItemTooltip && (
                        <Tooltip content={renderItemTooltip(item)}>
                          <Box
                            position="absolute"
                            width="100%"
                            height="100%"
                            top="0"
                            left="0"
                            style={{
                              cursor: 'pointer',
                              zIndex: 4,
                            }}
                          />
                        </Tooltip>
                      )}
                    </Box>
                    {highlightEl}
                  </React.Fragment>
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
