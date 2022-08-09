import { DataRow } from '../typings';
import { Channel, Layout, BarProps, ParsedBarProps, CategoryProps } from './typings';

export const applyChannel = <T>(
  row: DataRow,
  index: number,
  channel?: Channel<T>
): T | undefined => {
  if (channel instanceof Array) return row[channel[index]];
  if (channel instanceof Function) return channel(row)[index];
  return;
};

export const parseBarProps = (
  defaultFill: string,
  numberOfParallelBars: number,
  barProps: BarProps = {}
): ParsedBarProps => {
  const parsedBarProps: ParsedBarProps = [];
  const { name, size, fill, opacity, isAnimationActive } = barProps;

  for (let i = 0; i < numberOfParallelBars; i++) {
    const categoryProps: CategoryProps = {
      name: name?.[i],
      barSize: size?.[i],
      fill: fill?.[i] ?? defaultFill,
      opacity: opacity?.[i],
      isAnimationActive,
    };

    parsedBarProps.push(categoryProps);
  }

  return parsedBarProps;
};

// For some reason, in recharts a 'horizontal' bar chart
// actually means a 'vertical' bar chart. For our own API
// we use the correct terminology
export const getRechartsLayout = (layout: Layout) =>
  layout === 'vertical' ? 'horizontal' : 'vertical';
