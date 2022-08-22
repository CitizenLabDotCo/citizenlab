// typings
import { RefObject } from 'react';
import { Percentage } from 'typings';
import { NilOrError } from 'utils/helperUtils';
import { Position } from './_components/Legend/typings';

// PROPS
export interface BaseProps<Row> {
  width?: Percentage | number;
  height?: Percentage | number;
  data: Row[] | NilOrError;
  margin?: Margin;
  tooltip?: TooltipProps;
  legend?: LegendProps;
  emptyContainerContent?: React.ReactNode;
  innerRef?: RefObject<any>;
}

// STYLING
export interface Margin {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
}

// MAPPING
export interface Cell {
  fill: string;
  opacity?: number;
}

// AXES
export interface AxisProps {
  tickFormatter?: (value: any) => string;
  type?: 'number' | 'category';
  width?: number;
  tickLine?: boolean;
  hide?: boolean;
}

// TOOLTIP
export interface Tooltip {
  isAnimationActive?: boolean;
  cursor?: { fill: string };
  labelFormatter?: (value: any) => string;
}

export interface TooltipConfig {
  isAnimationActive: boolean;
  cursor: { fill: string };
  labelFormatter?: (value: any) => string;
}

export type TooltipProps =
  | boolean
  | Tooltip
  | ((props: TooltipConfig) => React.ReactNode);

// LEGEND
type LegendProps =
  | boolean
  | Legend

interface Legend {
  position: Position;
}

// UTILS
// https://stackoverflow.com/a/49752227
export type KeyOfType<T, V> = keyof {
  [P in keyof T as T[P] extends V ? P : never]: any;
};
