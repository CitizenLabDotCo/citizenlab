import React from 'react';

// components
import Icon from './Icon';

// typings
import {
  LegendItem,
  GraphDimensions,
  LegendDimensions,
  Position,
} from './typings';
import { Margin } from '../../typings';

interface Props {
  items: LegendItem[][];
  graphDimensions: GraphDimensions;
  legendDimensions: LegendDimensions;
  position: Position;
  margin?: Margin;
}

const getLegendTranslate = (
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

const dimensionsMatch = (
  items: LegendItem[][],
  { itemPositions }: LegendDimensions
) => {
  if (items.length !== itemPositions.length) return false;

  for (let i = 0; i < items.length; i++) {
    if (items[i].length !== itemPositions[i].length) return false;
  }

  return true;
};

const Legend = ({
  items,
  graphDimensions,
  legendDimensions,
  position,
  margin,
}: Props) => {
  if (!dimensionsMatch(items, legendDimensions)) return null;

  return (
    <g
      transform={getLegendTranslate(
        position,
        graphDimensions,
        legendDimensions,
        margin
      )}
    >
      {items.map((itemRow, rowIndex) =>
        itemRow.map((item, itemIndex) => {
          const { left, top } =
            legendDimensions.itemPositions[rowIndex][itemIndex];

          return (
            <g
              transform={`translate(${left},${top})`}
              key={`${rowIndex}-${itemIndex}`}
            >
              <Icon {...item} />
              <text
                transform="translate(18,12)"
                fontSize="14px"
                fill={item.color}
              >
                {item.label}
              </text>
            </g>
          );
        })
      )}
    </g>
  );
};

export default Legend;
