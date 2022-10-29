import React from 'react';

// components
import Icon from './Icon';

// styling
import { colors } from '../../styling';

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
  items: LegendItem[];
  graphDimensions: GraphDimensions;
  legendDimensions: LegendDimensions;
  position?: Position;
  textColor?: string;
  margin?: Margin;
}

const Legend = ({
  items,
  graphDimensions,
  legendDimensions,
  position = 'bottom-center',
  textColor = colors.legendText,
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
      {items.map((item, i) => {
        const { left, top } = legendDimensions.itemCoordinates[i];

        return (
          <g
            transform={`translate(${left},${top})`}
            key={i}
            className="graph-legend-item"
          >
            <Icon {...item} />
            <text transform="translate(18,12)" fontSize="14px" fill={textColor}>
              {item.label}
            </text>
          </g>
        );
      })}
    </g>
  );
};

export default Legend;
