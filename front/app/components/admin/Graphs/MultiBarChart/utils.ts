// DATA
export type DataRow = { name: string; [key: string]: any };
export type Data = DataRow[];

// MAPPING
type MappingFunction<T> = (row: DataRow) => T[];
type Channel<T> = string[] | MappingFunction<T>;

export interface Mapping {
  length: string[];
  fill?: Channel<string>;
  opacity?: Channel<number>;
}

export const applyChannel = <T>(
  row: DataRow,
  index: number,
  channel?: Channel<T>
): T | undefined => {
  if (channel instanceof Array) return row[channel[index]];
  if (channel instanceof Function) return channel(row)[index];
  return;
};

// BARS
export interface BarProps {
  name?: string[];
  size?: number[];
  fill?: string[];
  opacity?: (string | number)[];
  isAnimationActive?: boolean;
  categoryGap?: string | number;
}

interface CategoryProps {
  name?: string;
  barSize?: number;
  fill?: string;
  opacity?: string | number;
  isAnimationActive?: boolean;
}

type ParsedBarProps = CategoryProps[];

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

// LAYOUT
export type Layout = 'horizontal' | 'vertical';

// For some reason, in recharts a 'horizontal' bar chart
// actually means a 'vertical' bar chart. For our own API
// we use the correct terminology
export const getRechartsLayout = (layout: Layout) =>
  layout === 'vertical' ? 'horizontal' : 'vertical';

// AXES
export interface AxisProps {
  tickFormatter?: (value: any) => string;
  type?: 'number' | 'category';
  width?: number;
  tickLine?: boolean;
  hide?: boolean;
}
