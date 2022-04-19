import {
  Mapping as ConvertedMapping,
  BarProps as ConvertedBarProps,
  DataRow,
} from 'components/admin/Graphs/MultiBarChart/utils';

// MAPPING
type MappingFunction = (row: DataRow) => string;
type Fill = string | MappingFunction;

export interface Mapping {
  length?: string;
  fill?: Fill;
}

export const convertMapping = (mapping?: Mapping): ConvertedMapping => {
  if (!mapping) {
    return {
      length: ['value'],
    };
  }

  return {
    length: wrapIfAvailable(mapping.length) ?? ['value'],
    fill: convertFill(mapping.fill),
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

const convertFill = (fill?: Fill) =>
  fill instanceof Function
    ? (row: DataRow) => [fill(row)]
    : wrapIfAvailable(fill);
