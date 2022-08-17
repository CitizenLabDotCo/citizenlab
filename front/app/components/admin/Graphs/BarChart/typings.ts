import React from 'react';
import {
  Props as MultiBarChartProps,
  Bars as MultiBarChartBars,
} from '../MultiBarChart/typings';
import { KeyOfType } from '../typings';

export interface Props<Row>
  extends Omit<
    MultiBarChartProps<Row>,
    'mapping' | 'bars' | 'onMouseOver' | 'onMouseOut'
  > {
  mapping: Mapping<Row>;
  bars?: Bars;
  onMouseOver?: (payload: Payload<Row>, event: React.MouseEvent) => void;
  onMouseOut?: (payload: Payload<Row>, event: React.MouseEvent) => void;
}

export interface Payload<Row> {
  row: Row;
  rowIndex: number;
}

export interface Mapping<Row> {
  category: KeyOfType<Row, string>;
  length: KeyOfType<Row, number>;
  fill?: (payload: Payload<Row>) => string;
  opacity?: (payload: Payload<Row>) => number;
}

export interface Bars extends Omit<MultiBarChartBars, 'names'> {
  name?: string;
}
