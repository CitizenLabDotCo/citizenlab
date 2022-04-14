import {
  Mapping as ConvertedMapping,
  BarProps as ConvertedBarProps,
} from 'components/admin/Graphs/MultiBarChart/utils';

// MAPPING
export interface Mapping {
  length?: string;
  fill?: string;
}

export const convertMapping = (mapping?: Mapping): ConvertedMapping => {
  if (!mapping) {
    return {
      length: ['value'],
    };
  }

  return {
    length: wrapIfAvailable(mapping.length) ?? ['value'],
    fill: wrapIfAvailable(mapping.fill),
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
