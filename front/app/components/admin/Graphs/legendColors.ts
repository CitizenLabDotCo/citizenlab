import { colors } from '@citizenlab/cl2-component-library';

export const EMPTY_COLOR = colors.coolGrey300;

/**
 * Maps legend keys to colors. Null keys (representing "No answer")
 * get EMPTY_COLOR; all others get sequential colors from the scheme.
 */
export const legendColorMap = (
  legend: (string | number | null)[],
  colorScheme: string[]
): Map<string | number | null, string> => {
  return legend.reduce((acc, value, i) => {
    if (value === null) {
      acc.set(null, EMPTY_COLOR);
    } else {
      acc.set(value, colorScheme[i % colorScheme.length]);
    }
    return acc;
  }, new Map<string | number | null, string>());
};

/**
 * Returns an ordered array of colors matching the legend positions.
 * Convenience wrapper around legendColorMap for components that
 * need positional color access (e.g., Legend, SentimentQuestion).
 */
export const legendColors = (
  legend: (string | number | null)[],
  colorScheme: string[]
): string[] => {
  const colorMap = legendColorMap(legend, colorScheme);
  return legend.map((key) => colorMap.get(key) ?? EMPTY_COLOR);
};
