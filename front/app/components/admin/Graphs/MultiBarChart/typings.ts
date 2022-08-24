import React from 'react';
import {
  BaseProps,
  Margin,
  AxisProps,
  KeyOfType,
  Cell,
  BaseLabels,
  BaseMapping,
} from '../typings';

// PROPS
export interface Props<Row> extends BaseProps<Row> {
  mapping: Mapping<Row>;
  bars?: Bars;
  layout?: Layout;
  margin?: Margin;
  xaxis?: AxisProps;
  yaxis?: AxisProps;
  labels?: boolean | Labels | ((props: LabelConfig) => React.ReactNode);
  onMouseOver?: (payload: Payload<Row>, event: React.MouseEvent) => void;
  onMouseOut?: (payload: Payload<Row>, event: React.MouseEvent) => void;
}

interface Payload<Row> {
  row: Row;
  rowIndex: number;
  barIndex: number;
}

export interface Mapping<Row> extends BaseMapping<Payload<Row>> {
  category: KeyOfType<Row, string>;
  length: KeyOfType<Row, number>[];
}

export interface Bars {
  names?: string[];
  size?: number;
  categoryGap?: string | number;
  isAnimationActive?: boolean;
}

interface Labels extends BaseLabels {
  position?: 'top' | 'right';
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
