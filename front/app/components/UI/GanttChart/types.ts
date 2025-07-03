import { ReactNode } from 'react';

import { IconNames } from '@citizenlab/cl2-component-library';

/**
 * Defines the structure for a single item to be displayed on the Gantt chart.
 */
export type GanttItem = {
  id: string;
  title: string;
  start: string | null;
  end: string | null;
  folder?: string | null;
  highlightStartDate?: string | null;
  highlightEndDate?: string | null;
  icon?: IconNames;
  color?: string;
};

/**
 * Defines the props for the main GanttChart component.
 */
export type GanttChartProps = {
  chartTitle?: string;
  items: GanttItem[];
  startDate?: Date;
  endDate?: Date;
  renderItemTooltip?: (item: GanttItem) => ReactNode;
  showTodayLine?: boolean;
  onItemLabelClick?: (item: GanttItem) => void;
};
