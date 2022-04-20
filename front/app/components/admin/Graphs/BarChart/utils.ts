import {
  Mapping as ConvertedMapping,
  BarProps as ConvertedBarProps,
  DataRow,
} from 'components/admin/Graphs/MultiBarChart/utils';

// MAPPING
type MappingFunction<T> = (row: DataRow) => T;
type Channel<T> = string | MappingFunction<T>;

export interface Mapping {
  length?: string;
  fill?: Channel<string>;
  opacity?: Channel<number>;
}

export const convertMapping = (mapping?: Mapping): ConvertedMapping => {
  if (!mapping) {
    return {
      length: ['value'],
    };
  }

  return {
    length: wrapIfAvailable(mapping.length) ?? ['value'],
    fill: convertChannel(mapping.fill),
    opacity: convertChannel(mapping.opacity),
  };
};

// BARS
export interface BarProps {
  name?: string;
  size?: number;
  fill?: string;
  opacity?: string | number;
  isAnimationActive?: boolean;
}

export const convertBarProps = (
  barProps?: BarProps
): ConvertedBarProps | undefined => {
  if (!barProps) return;

  const { name, size, fill, opacity, isAnimationActive } = barProps;

  return {
    name: wrapIfAvailable(name),
    size: wrapIfAvailable(size),
    fill: wrapIfAvailable(fill),
    opacity: wrapIfAvailable(opacity),
    isAnimationActive,
  };
};

// UTILS
const wrapIfAvailable = <T>(value?: T): T[] | undefined =>
  value ? [value] : undefined;

const convertChannel = <T>(channel?: Channel<T>) =>
  channel instanceof Function
    ? (row: DataRow) => [channel(row)]
    : wrapIfAvailable(channel);
