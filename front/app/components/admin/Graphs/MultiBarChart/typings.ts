import {
  Margin,
  AxisProps,
  RenderLabelsProps,
  RenderTooltipProps,
  KeyOfType,
  Color,
  Channel,
} from '../typings';
import { RefObject } from 'react';

// PROPS
export interface Props {
  config: NaiveConfig;
  width?: string | number;
  height?: string | number;
  layout?: Layout;
  margin?: Margin;
  xaxis?: AxisProps;
  yaxis?: AxisProps;
  renderLabels?: (props: RenderLabelsProps) => React.ReactNode;
  renderTooltip?: (props: RenderTooltipProps) => React.ReactNode;
  emptyContainerContent?: React.ReactNode;
  className?: string;
  innerRef?: RefObject<any>;
}

// CONFIG
export interface Config<Row> {
  data?: Row[] | null | Error;
  mapping: Mapping<Row>;
  bars: Bars;
}

export interface Mapping<Row> {
  category: KeyOfType<Row, string>;
  length: KeyOfType<Row, number>[];
  fill?: Channel<Row, Color[]>;
  opacity?: Channel<Row, number[]>;
}

export type NaiveConfig = Config<Record<string, any>>;

export interface Bars {
  barSize?: number;
  categoryGap?: string | number;
  isAnimationActive?: boolean;
}

// PARSED CONFIG
export interface Category extends Bars {
  name: string;
  dataKey: string;
  cells?: Cell[];
}

interface Cell {
  fill?: string;
  opacity?: number;
}

// LAYOUT
export type Layout = 'horizontal' | 'vertical';
