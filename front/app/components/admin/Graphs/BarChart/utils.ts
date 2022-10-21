import {
  Bars as ConvertedBars,
  Mapping as ConvertedMapping,
} from 'components/admin/Graphs/MultiBarChart/typings';
import { Bars, Mapping } from './typings';

export const convertMapping = <Row>(
  mapping: Mapping<Row>
): ConvertedMapping<Row> => ({
  category: mapping.category,
  length: [mapping.length],
  fill: mapping.fill,
  opacity: mapping.opacity,
});

export const convertBars = (bars?: Bars): ConvertedBars | undefined => {
  if (!bars) return;
  const { name, ...rest } = bars;

  return { names: name ? [name] : undefined, ...rest };
};
