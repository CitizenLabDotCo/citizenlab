import {
  Props as MultiBarChartProps,
  Bars as MultiBarChartBars,
} from '../MultiBarChart/typings';
import { KeyOfType, Channel, Color } from '../typings';

export interface Props<Row>
  extends Omit<MultiBarChartProps<Row>, 'mapping' | 'bars'> {
  mapping: Mapping<Row>;
  bars?: Bars;
}

export interface Mapping<Row> {
  category: KeyOfType<Row, string>;
  length: KeyOfType<Row, number>;
  fill?: Channel<Row, Color>;
  opacity?: Channel<Row, number>;
}

export interface Bars extends Omit<MultiBarChartBars, 'names'> {
  name?: string;
}
