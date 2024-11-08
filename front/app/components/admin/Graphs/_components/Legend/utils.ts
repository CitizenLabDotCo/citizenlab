import { Margin } from '../../typings';

import {
  Position,
  ItemCoordinates,
  GraphDimensions,
  LegendDimensions,
  LegendItem,
} from './typings';

export const getLegendTranslate = (
  position: Position,
  { width: graphWidth, height: graphHeight }: GraphDimensions,
  { width: legendWidth, height: legendHeight }: LegendDimensions,
  margin?: Margin
) => {
  const top = graphHeight - legendHeight - (margin?.bottom ?? 0);

  if (position === 'bottom-left') return `translate(8,${top})`;

  if (position === 'bottom-center') {
    const left = (graphWidth - legendWidth) / 2 + 8;
    return `translate(${left},${top})`;
  }

  if (position === 'right-center') {
    const left = graphWidth - legendWidth - (margin?.left ?? 0);
    const top = (graphHeight - legendHeight) / 2 + 8;
    return `translate(${left},${top})`;
  }

  const left = graphWidth - legendWidth + 8;
  return `translate(${left},${top})`;
};

export const itemsMatch = (
  items: LegendItem[],
  { itemCoordinates }: LegendDimensions
) => {
  return items.length === itemCoordinates.length;
};

export const getJustifyContent = (position: Position) => {
  if (position === 'bottom-center') return 'center';
  if (position === 'bottom-left') return 'flex-start';
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (position?.includes('right')) return 'flex-start';
  return 'flex-end';
};

export const getLegendDimensions = (items: Element[]) => {
  const corner = getCorner(items);

  let width = 0;
  let height = 0;
  const itemCoordinates: ItemCoordinates[] = [];

  items.forEach((item) => {
    const bbox = item.getBoundingClientRect();

    const relativeLeft = bbox.left - corner.left;
    const relativeTop = bbox.top - corner.top;
    const relativeRight = relativeLeft + bbox.width;
    const relativeBottom = relativeTop + bbox.height;

    itemCoordinates.push({
      left: relativeLeft,
      top: relativeTop,
    });

    width = Math.max(width, relativeRight);
    height = Math.max(height, relativeBottom);
  });

  return { width, height, itemCoordinates };
};

const getCorner = (items: Element[]) => {
  return items.reduce(
    (acc, item) => {
      const { left, top } = item.getBoundingClientRect();

      return {
        left: Math.min(acc.left, left),
        top: Math.min(acc.top, top),
      };
    },
    { left: Infinity, top: Infinity }
  );
};
