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
  numberOfCategories: number,
  barProps: BarProps = {}
): ParsedBarProps => {
  const parsedBarProps: ParsedBarProps = [];
  const { name, size, fill, opacity, isAnimationActive } = barProps;

  for (let i = 0; i < numberOfCategories; i++) {
    const categoryProps: CategoryProps = {
      name,
      barSize: size?.[i],
      fill: fill?.[i] ?? defaultFill,
      opacity: opacity?.[i],
      isAnimationActive,
    };

    parsedBarProps.push(categoryProps);
  }

  return parsedBarProps;
};
