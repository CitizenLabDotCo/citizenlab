import { Margin, Data, AxisProps, RenderLabelsProps, RenderTooltipProps, DataRow } from '../typings';
import { RefObject } from 'react'

export interface Props {
  width?: string | number;
  height?: string | number;
  data?: Data | null | Error;
  mapping: Mapping;
  layout?: Layout;
  margin?: Margin;
  bars?: BarProps;
  xaxis?: AxisProps;
  yaxis?: AxisProps;
  renderLabels?: (props: RenderLabelsProps) => React.ReactNode;
  renderTooltip?: (props: RenderTooltipProps) => React.ReactNode;
  emptyContainerContent?: React.ReactNode;
  className?: string;
  innerRef?: RefObject<any>;
}

// MAPPING
type MappingFunction<T> = (row: DataRow) => T[];
export type Channel<T> = string[] | MappingFunction<T>;

export interface Mapping {
  length: string[];
  fill?: Channel<string>;
  opacity?: Channel<number>;
}

// LAYOUT
export type Layout = 'horizontal' | 'vertical';

// BARS
export interface BarProps {
  name?: string[];
  size?: number[];
  fill?: string[];
  opacity?: (string | number)[];
  isAnimationActive?: boolean;
  categoryGap?: string | number;
}

export interface CategoryProps {
  name?: string;
  barSize?: number;
  fill?: string;
  opacity?: string | number;
  isAnimationActive?: boolean;
}

export type ParsedBarProps = CategoryProps[];