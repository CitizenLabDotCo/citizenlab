import { Mapping, Bars } from './typings';
import {
  Mapping as ConvertedMapping,
  Bars as ConvertedBars,
} from 'components/admin/Graphs/MultiBarChart/typings';
import { Channel } from '../typings';

export const convertMapping = <T>(
  mapping: Mapping<T>
): ConvertedMapping<T> => ({
  category: mapping.category,
  length: [mapping.length],
  fill: convertChannel(mapping.fill),
  opacity: convertChannel(mapping.opacity),
});

export const convertBars = (bars?: Bars): ConvertedBars | undefined => {
  if (!bars) return;
  const { name, ...rest } = bars;

  return { names: [name], ...rest };
};

// UTILS
const convertChannel = <Row, Output>(channel?: Channel<Row, Output>) => {
  if (channel === undefined) return;
  return (row: Row, index: number) => [channel(row, index)];
};
