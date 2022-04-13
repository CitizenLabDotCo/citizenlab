// MAPPING
export interface Mapping {
  length: string[];
  fill?: string[];
}

// BARS
export interface BarProps {
  name?: string;
  size?: number[];
  fill?: string[];
  opacity?: (string | number)[];
  isAnimationActive?: boolean;
}

interface ParsedBarProps extends Omit<BarProps, 'fill' | 'size'> {
  barSize?: number[];
  fill: string[];
}

export const parseBarProps = (
  defaultFill: string,
  numberOfBars: number,
  barProps?: BarProps
): ParsedBarProps => {
  const defaultBarProps = { fill: Array(numberOfBars).fill(defaultFill) };
  if (!barProps) return defaultBarProps;

  const { size, ...otherBarProps } = barProps;
  return { ...defaultBarProps, barSize: size, ...otherBarProps };
};
