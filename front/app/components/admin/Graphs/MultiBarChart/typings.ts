import React from 'react';
import {
  BaseProps,
  AxisProps,
  KeyOfType,
  Cell,
  BaseLabels,
  BaseMapping,
  CornerRadius,
} from '../typings';

// PROPS
export interface Props<Row> extends BaseProps<Row, Payload<Row>> {
  mapping: Mapping<Row>;
  bars?: Bars;
  layout?: Layout;
  xaxis?: AxisProps;
  yaxis?: AxisProps;
  labels?: boolean | Labels | ((props: LabelConfig) => React.ReactNode);
}

interface Payload<Row> {
  row: Row;
  rowIndex: number;
  barIndex: number;
}

export interface Mapping<Row> extends BaseMapping<Payload<Row>> {
  length: KeyOfType<Row, number>[];
  category?: KeyOfType<Row, string>;
  cornerRadius?: (payload: Payload<Row>) => CornerRadius;
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
