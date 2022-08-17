import React from 'react';
import {
  Props as MultiBarChartProps,
  Bars as MultiBarChartBars,
} from '../MultiBarChart/typings';
import { KeyOfType, Channel } from '../typings';

export interface Props<Row>
  extends Omit<
    MultiBarChartProps<Row>,
    'mapping' | 'bars' | 'onMouseOver' | 'onMouseOut'
  > {
  mapping: Mapping<Row>;
  bars?: Bars;
  onMouseOver?: (row: Row, rowIndex: number, event: React.MouseEvent) => void;
  onMouseOut?: (row: Row, rowIndex: number, event: React.MouseEvent) => void;
}

export interface Mapping<Row> {
  category: KeyOfType<Row, string>;
  length: KeyOfType<Row, number>;
  fill?: Channel<Row, string>;
  opacity?: Channel<Row, number>;
}

export interface Bars extends Omit<MultiBarChartBars, 'names'> {
  name?: string;
}
