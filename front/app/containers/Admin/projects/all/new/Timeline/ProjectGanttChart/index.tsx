import React, { useRef } from 'react';

import { Box, Tooltip } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

export type GanttProject = {
  id: string;
  title: string;
  start: string | null;
  end: string | null;
  folder: string;
  daysLeft?: number;
};

type Props = {
  projects: GanttProject[];
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

const LEFT_COL_WIDTH = 260;
const DAY_WIDTH = 40;
const TIMELINE_HEIGHT = 40;
const ROW_HEIGHT = 40;

const ProjectGanttChart: React.FC<Props> = ({ projects }) => {
  const { formatMessage } = useIntl();
  const today = new Date();
  const chartStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const chartEnd = new Date(today.getFullYear(), today.getMonth() + 2, 0);
  const months = getMonthMeta(chartStart, chartEnd);

  const daysBetween = (a: Date, b: Date) =>
    Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
  const totalDays = daysBetween(chartStart, chartEnd);
  const todayOffset = daysBetween(chartStart, today);

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
        {/* Project column header */}
        <Box
          width={`${LEFT_COL_WIDTH}px`}
          minWidth={`${LEFT_COL_WIDTH}px`}
          maxWidth={`${LEFT_COL_WIDTH}px`}
          bg="#fff"
          style={{
            position: 'sticky',
            left: 0,
            zIndex: 3,
            borderRight: '1px solid #e0e0e0',
            fontWeight: 700,
          }}
          display="flex"
          alignItems="center"
          height={`${TIMELINE_HEIGHT * 2}px`}
          pl="16px"
        >
          {formatMessage(messages.project)}
        </Box>

        {/* Timeline header */}
        <Box flex="1" overflow="hidden">
          <Box ref={timelineHeaderRef} style={{ overflow: 'hidden' }}>
            {/* Months row */}
            <Box
              display="flex"
              height={`${TIMELINE_HEIGHT}px`}
              borderBottom="1px solid #e0e0e0"
              style={{
                overflow: 'hidden',
                minWidth: `${totalDays * DAY_WIDTH}px`,
                background: '#fafbfc',
              }}
            >
              {months.map((month, i) => (
                <Box
                  key={month.label}
                  minWidth={`${month.daysInMonth * DAY_WIDTH}px`}
                  width={`${month.daysInMonth * DAY_WIDTH}px`}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  style={{
                    fontWeight: 800,
                    color: '#222',
                    borderRight:
                      i === months.length - 1 ? undefined : '1px solid #e0e0e0',
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

            {/* Days row */}
            <Box
              display="flex"
              height={`${TIMELINE_HEIGHT}px`}
              style={{
                overflow: 'hidden',
                minWidth: `${totalDays * DAY_WIDTH}px`,
                background: '#fafbfc',
              }}
            >
              {months.map((month) =>
                Array.from({ length: month.daysInMonth }).map((_, idx) => (
                  <Box
                    key={`${month.label}-${idx + 1}`}
                    minWidth={`${DAY_WIDTH}px`}
                    width={`${DAY_WIDTH}px`}
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
          </Box>
        </Box>
      </Box>

      {/* Body */}
      <Box display="flex" position="relative" height="100%">
        {/* Project names column */}
        <Box
          width={`${LEFT_COL_WIDTH}px`}
          minWidth={`${LEFT_COL_WIDTH}px`}
          maxWidth={`${LEFT_COL_WIDTH}px`}
          bg="#fff"
          style={{
            position: 'sticky',
            left: 0,
            zIndex: 2,
            borderRight: '1px solid #e0e0e0',
          }}
        >
          {projects.map((project) => (
            <Box
              key={project.id}
              height={`${ROW_HEIGHT}px`}
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
              {project.title}
            </Box>
          ))}
        </Box>

        {/* Timeline body */}
        <Box
          flex="1"
          overflow="auto"
          ref={timelineBodyRef}
          onScroll={onTimelineScroll}
        >
          <Box
            minWidth={`${totalDays * DAY_WIDTH}px`}
            position="relative"
            style={{
              background: `repeating-linear-gradient(
                to bottom,
                #fff,
                #fff ${ROW_HEIGHT - 1}px,
                #e0e0e0 ${ROW_HEIGHT - 1}px,
                #e0e0e0 ${ROW_HEIGHT}px
              )`,
            }}
          >
            {projects.map((project) => {
              const start = project.start ? new Date(project.start) : undefined;
              const end = project.end ? new Date(project.end) : undefined;
              const left = start
                ? `${daysBetween(chartStart, start) * DAY_WIDTH}px`
                : '0px';
              const width =
                start && end
                  ? `${(daysBetween(start, end) + 1) * DAY_WIDTH}px`
                  : '0px';

              return (
                <Box
                  key={project.id}
                  height={`${ROW_HEIGHT}px`}
                  position="relative"
                >
                  {/* Project bar */}
                  {parseInt(width, 10) > 0 && (
                    <Tooltip
                      content={
                        <Box>
                          <strong>{project.title}</strong>
                          <span>
                            {formatMessage(messages.daysLeft, {
                              count: project.daysLeft || 63,
                            })}
                          </span>
                        </Box>
                      }
                    >
                      <Box
                        position="absolute"
                        left={left}
                        width={width}
                        height="24px"
                        top="8px"
                        bg="#e6f0fa"
                        border="1.5px solid #7bb6e6"
                        borderRadius="4px"
                        cursor="pointer"
                        zIndex="1"
                      />
                    </Tooltip>
                  )}
                </Box>
              );
            })}

            {/* Today line */}
            <Box
              position="absolute"
              top="0"
              left={`${todayOffset * DAY_WIDTH}px`}
              width="2px"
              height="100%"
              bg="#2176ff"
              style={{ zIndex: 2 }}
            />

            {/* Vertical grid lines */}
            <Box
              position="absolute"
              top="0"
              left="0"
              width="100%"
              height="100%"
              style={{ zIndex: 0 }}
            >
              {months.map((month) =>
                Array.from({ length: month.daysInMonth }).map((_, idx) => (
                  <Box
                    key={`grid-${month.label}-${idx}`}
                    position="absolute"
                    // left={`${month.offsetDays + idx) * DAY_WIDTH}px`}
                    width="1px"
                    height="100%"
                    bg={idx === 0 ? '#e0e0e0' : '#f0f0f0'}
                  />
                ))
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ProjectGanttChart;
