import { RefObject } from 'react';

import { Percentage } from 'typings';

import { NilOrError } from 'utils/helperUtils';

import { Position, LegendItem } from './_components/Legend/typings';

// PROPS
export interface BaseProps<Row, Payload> {
  width?: Percentage | number;
  height?: Percentage | number;
  data: Row[] | NilOrError;
  margin?: Margin;
  tooltip?: TooltipProps;
  legend?: Legend;
  emptyContainerContent?: React.ReactNode;
  innerRef?: RefObject<any>;
  onMouseOver?: (payload: Payload, event: React.MouseEvent) => void;
  onMouseOut?: (payload: Payload, event: React.MouseEvent) => void;
}
export interface AccessibilityProps {
  ariaLabel?: string;
  ariaDescribedBy?: string;
}

export interface RechartsAccessibilityProps {
  accessibilityLayer?: boolean;
  role?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
  tabIndex?: number;
}

// STYLING
export interface Margin {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
}

// MAPPING
export interface BaseMapping<Payload> {
  fill?: (payload: Payload) => string;
  opacity?: (payload: Payload) => number;
}

export interface Cell {
  fill: string;
  opacity?: number;
}

export type CornerRadius = number | [number, number, number, number];

// AXES
export interface AxisProps {
  tickFormatter?: (value: any) => string;
  type?: 'number' | 'category';
  width?: number;
  tickLine?: boolean;
  hide?: boolean;
  domain?: Domain;
}

export interface XAxisProps extends AxisProps {
  orientation?: 'top' | 'bottom';
}

export interface YAxisProps extends AxisProps {
  orientation?: 'left' | 'right';
}

type Domain = [d1: DomainBound, d2: DomainBound];

type DomainBound = 'dataMin' | 'dataMax' | 'auto' | number;

// LABELS
export interface BaseLabels {
  fill?: string;
  fontSize?: number;
  formatter?: (value: number) => string;
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

export interface Legend {
  items: LegendItem[];
  position?: Position;
  textColor?: string;
  marginTop?: number;
  marginLeft?: number;
  maintainGraphSize?: boolean;
}

// UTILS
// https://stackoverflow.com/a/49752227
export type KeyOfType<T, V> = keyof {
  [P in keyof T as T[P] extends V ? P : never]: any;
};
