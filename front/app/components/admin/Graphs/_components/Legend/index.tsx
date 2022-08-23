import React from 'react';

// components
import Icon from './Icon';

// utils
import { itemsMatch, getLegendTranslate } from './utils';

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
  position?: Position;
  margin?: Margin;
}

const Legend = ({
  items,
  graphDimensions,
  legendDimensions,
  position = 'bottom-center',
  margin,
}: Props) => {
  if (!itemsMatch(items, legendDimensions)) return null;

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
