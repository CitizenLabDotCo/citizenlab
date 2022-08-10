// styling
import { colors } from '../styling';

// typings
import { Mapping, Bars, Category, Layout } from './typings';

export const getCategories = <Row>(
  data: Row[],
  mapping: Mapping<Row>,
  bars?: Bars
) => {
  const { category, length, fill, opacity } = mapping;

  const categories: Category[] = length.map((lengthColumn, categoryIndex) => {
    const cells =
      (fill || opacity) &&
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
