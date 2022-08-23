import {
  Position,
  ItemPosition,
  GraphDimensions,
  LegendDimensions,
  LegendItem,
} from './typings';
import { Margin } from '../../typings';

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

  const left = graphWidth - legendWidth + 8;
  return `translate(${left},${top})`;
};

export const itemsMatch = (
  items: LegendItem[][],
  { itemPositions }: LegendDimensions
) => {
  if (items.length !== itemPositions.length) return false;

  for (let i = 0; i < items.length; i++) {
    if (items[i].length !== itemPositions[i].length) return false;
  }

  return true;
};

export const getJustifyContent = (position: Position) => {
  if (position === 'bottom-center') return 'center';
  if (position === 'bottom-left') return 'flex-start';
  return 'flex-end';
};

export const getLegendDimensions = (itemRows: Element[]) => {
  const corner = getCorner(itemRows);

  let width = 0;
  let height = 0;
  const itemPositions: ItemPosition[][] = [];

  itemRows.forEach((itemRow, rowIndex) => {
    const items = itemRow.getElementsByClassName('fake-legend-item');

    let rowWidth = 0;
    let rowHeight = 0;
    itemPositions.push([]);

    [...items].forEach((item) => {
      const { top, left, width, height } = item.getBoundingClientRect();

      rowWidth += width;
      rowHeight = Math.max(rowHeight, height);

      itemPositions[rowIndex].push({
        left: left - corner.left,
        top: top - corner.top,
      });
    });

    width = Math.max(width, rowWidth);
    height += rowHeight;
  });

  return { width, height, itemPositions };
};

const getCorner = (itemRows: Element[]) => {
  return itemRows.reduce(
    (acc, itemRow) => {
      let minLeft = Infinity;
      let minTop = Infinity;

      const items = itemRow.getElementsByClassName('fake-legend-item');

      [...items].forEach((item) => {
        const { left, top } = item.getBoundingClientRect();
        minLeft = Math.min(minLeft, left);
        minTop = Math.min(minTop, top);
      });

      return {
        left: Math.min(acc.left, minLeft),
        top: Math.min(acc.top, minTop),
      };
    },
    { left: Infinity, top: Infinity }
  );
};
