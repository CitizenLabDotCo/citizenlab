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
import { NilOrError } from 'utils/helperUtils';

// PROPS
export interface Props<Row> {
  width?: string | number;
  height?: string | number;
  data: Row[] | NilOrError;
  mapping: Mapping<Row>;
  bars?: Bars;
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

export interface Mapping<Row> {
  category: KeyOfType<Row, string>;
  length: KeyOfType<Row, number>[];
  fill?: Channel<Row, Color[]>;
  opacity?: Channel<Row, number[]>;
}

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
