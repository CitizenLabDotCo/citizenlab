import {
  KeyOfType,
  BaseProps,
  BaseMapping,
  CornerRadius,
  AccessibilityProps,
} from '../typings';

export interface Props<Row>
  extends BaseProps<Row, Payload<Row>>,
    AccessibilityProps {
  mapping: Mapping<Row>;
  showComparison?: boolean;
  primaryColor?: string;
  comparisonColor?: string;
  barHeight?: number;
}

export interface Payload<Row> {
  row: Row;
  rowIndex: number;
  category: string;
  primaryValue: number;
  comparisonValue?: number;
  count?: number;
}

export interface Mapping<Row> extends BaseMapping<Payload<Row>> {
  category: KeyOfType<Row, string>;
  primaryValue: KeyOfType<Row, number>;
  comparisonValue?: KeyOfType<Row, number | undefined>;
  count?: KeyOfType<Row, number>;
  cornerRadius?: (payload: Payload<Row>) => CornerRadius;
}
