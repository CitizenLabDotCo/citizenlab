// typings
import { NilOrError } from 'utils/helperUtils';
import { BaseMapping, KeyOfType } from '../typings';

export interface Props<Row> {
  width?: string | number;
  height?: string | number;
  data: Row[] | NilOrError;
  mapping: Mapping<Row>;
  centerLabel?: string;
  centerValue?: string;
  emptyContainerContent?: React.ReactNode;
}

interface Mapping<Row> extends BaseMapping<Row> {
  angle: KeyOfType<Row, number>;
}