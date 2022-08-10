// styling
import { colors } from '../styling';

// utils
import { hasNoData } from '../utils';

// typings
import { Config, Category, Layout } from './typings';

export const parseConfig = <Row>({ data, mapping, bars }: Config<Row>) => {
  if (hasNoData(data)) return null;

  const { category, length, fill, opacity } = mapping;

  const categories: Category[] = length.map((lengthColumn, categoryIndex) => {
    const cells = data.map((row, rowIndex) => ({
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
