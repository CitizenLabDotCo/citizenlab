import { BaseProps, KeyOfType, Cell } from '../typings';
import { Payload } from '../BarChart/typings';

export interface Props<Row> extends BaseProps<Row> {
  mapping: Mapping<Row>;
  bars?: Bars;
}

export interface Mapping<Row> {
  name: KeyOfType<Row, string>;
  length: KeyOfType<Row, number>;
  total: KeyOfType<Row, number>;
  fill?: (payload: Payload<Row>) => string;
  opacity?: (payload: Payload<Row>) => number;
}

export interface Bars {
  barBackground?: string;
  isAnimationActive?: boolean;
}

// PARSED CONFIGS
export interface ProgressBarConfig {
  props: {
    dataKey: string;
    isAnimationActive?: boolean;
  };
  cells: Cell[];
}

export interface TotalBarConfig {
  props: {
    dataKey: string;
    fill: string;
    isAnimationActive?: boolean;
  };
}
