import {
  BaseProps,
  AxisProps,
  KeyOfType,
  // BaseLabels,
} from '../typings';

import { IResolution } from 'components/admin/ResolutionControl';

// PROPS
export interface Props<Row> extends BaseProps<Row, Payload> {
  mapping: Mapping<Row>;
  xaxis?: AxisProps;
  yaxis?: AxisProps;
  resolution?: IResolution;
}

interface Payload {
  lineIndex: number;
}

export interface Mapping<Row> {
  x: KeyOfType<Row, string>;
  yBars: KeyOfType<Row, number>[];
  yLine: KeyOfType<Row, number>;
}
