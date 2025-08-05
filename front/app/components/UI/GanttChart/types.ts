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
  // Optional highlight range for the item
  highlight?: {
    // start of highlight range */
    start: string | null;
    // end of highlight range (null = open-ended)
    end: string | null;
  };
  icon?: IconNames;
  color?: string;
};

export type ViewBounds = {
  // left boundary
  left: Date;
  // right boundary
  right: Date;
};

export type GanttChartProps = {
  chartTitle?: string;
  items: GanttItem[];
  renderItemTooltip?: (item: GanttItem) => ReactNode;
  showTodayLine?: boolean;
  onItemLabelClick?: (item: GanttItem) => void;
};
