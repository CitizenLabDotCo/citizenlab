// styling
import { colors } from '../styling';

// utils
import { hasNoData } from '../utils';
import { isNilOrError, NilOrError } from 'utils/helperUtils';

// typings
import { Config, Category, Layout } from './typings';

// Utility to add the correct types to the config
export const createConfig = <Row>(
  data: Row[] | NilOrError,
  { mapping, bars }: Config<Row>
): Config<Row> | null => {
  if (isNilOrError(data)) return null;
  return { mapping, bars };
};

export const parseConfig = <Row>(
  data: Row[] | NilOrError,
  config: Config<Row> | null
) => {
  if (hasNoData(data) || config === null) return null;

  const { mapping, bars } = config;

  const { category, length, fill, opacity } = mapping;

  const categories: Category[] = length.map((lengthColumn, categoryIndex) => {
    const cells =
      fill &&
      opacity &&
      data.map((row, rowIndex) => ({
        fill: fill && colors[fill(row, rowIndex)[categoryIndex]],
        opacity: opacity && opacity(row, rowIndex)[categoryIndex],
      }));

    return {
      name: category as string,
      dataKey: lengthColumn as string,
      ...bars,
      cells,
    };
  });

  return categories;
};

// For some reason, in recharts a 'horizontal' bar chart
// actually means a 'vertical' bar chart. For our own API
// we use the correct terminology
export const getRechartsLayout = (layout: Layout) =>
  layout === 'vertical' ? 'horizontal' : 'vertical';
