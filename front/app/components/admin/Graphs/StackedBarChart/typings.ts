import { Props as MultiBarChartProps } from '../MultiBarChart/typings';
import { KeyOfType, BaseMapping, CornerRadius } from '../typings';

export interface Props<Row>
  extends Omit<
    MultiBarChartProps<Row>,
    'mapping' | 'onMouseOver' | 'onMouseOut'
  > {
  mapping: Mapping<Row>;
  onMouseOver?: (payload: Payload<Row>, event: React.MouseEvent) => void;
  onMouseOut?: (payload: Payload<Row>, event: React.MouseEvent) => void;
}

interface Payload<Row> {
  row: Row;
  rowIndex: number;
  stackIndex: number;
}

export interface Mapping<Row> extends BaseMapping<Payload<Row>> {
  category: KeyOfType<Row, string>;
  stackedLength: KeyOfType<Row, number>[];
  cornerRadius?: (payload: Payload<Row>) => CornerRadius;
}
