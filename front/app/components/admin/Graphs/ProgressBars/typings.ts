import { BaseProps, KeyOfType } from '../typings';
import { Payload } from '../BarChart/typings';

export interface Props<Row> extends BaseProps<Row> {
  mapping: Mapping<Row>;
}

interface Mapping<Row> {
  name: KeyOfType<Row, string>;
  length: KeyOfType<Row, number>;
  fill?: (payload: Payload<Row>) => string;
  opacity?: (payload: Payload<Row>) => number;
}
