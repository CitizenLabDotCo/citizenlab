import { Mapping, Bars } from './typings';
import {
  Mapping as ConvertedMapping,
  Bars as ConvertedBars,
} from 'components/admin/Graphs/MultiBarChart/typings';

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
