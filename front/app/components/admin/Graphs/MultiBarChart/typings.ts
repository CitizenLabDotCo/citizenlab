import { RefObject } from 'react';
import { Percentage } from 'typings';
import {
  Margin,
  AxisProps,
  RenderTooltipProps,
  KeyOfType,
  Channel,
  Cell,
} from '../typings';
import { NilOrError } from 'utils/helperUtils';

// PROPS
export interface Props<Row> {
  width?: Percentage | number;
  height?: Percentage | number;
  data: Row[] | NilOrError;
  mapping: Mapping<Row>;
  bars?: Bars;
  layout?: Layout;
  margin?: Margin;
  xaxis?: AxisProps;
  yaxis?: AxisProps;
  labels?: boolean | Labels | ((props: LabelConfig) => React.ReactNode);
  renderTooltip?: (props: RenderTooltipProps) => React.ReactNode;
  emptyContainerContent?: React.ReactNode;
  innerRef?: RefObject<any>;
}

export interface Mapping<Row> {
  category: KeyOfType<Row, string>;
  length: KeyOfType<Row, number>[];
  fill?: Channel<Row, string[]>;
  opacity?: Channel<Row, number[]>;
}

export interface Bars {
  names?: string[];
  size?: number;
  categoryGap?: string | number;
  isAnimationActive?: boolean;
}

export interface Labels {
  fill?: string;
  fontSize?: number;
  position?: 'top' | 'right';
  formatter?: (value: number) => string;
}

// PARSED CONFIGS
export interface BarConfig {
  props: {
    name?: string;
    dataKey: string;
    barSize?: number;
    isAnimationActive?: boolean;
  };
  cells: Cell[];
}

export interface LabelConfig {
  fill: string;
  fontSize: number;
  position: 'top' | 'right';
  formatter?: (value: number) => string;
}

// LAYOUT
export type Layout = 'horizontal' | 'vertical';
