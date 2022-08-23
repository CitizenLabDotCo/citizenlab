import React from 'react';

// components
import Icon from './Icon';

// typings
import { Item, GraphDimensions, LegendDimensions, Position } from './typings';
import { Margin } from '../../typings';

interface Props {
  items: Item[];
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

const Legend = ({
  items,
  graphDimensions,
  legendDimensions,
  position,
  margin,
}: Props) => (
  <g
    transform={getLegendTranslate(
      position,
      graphDimensions,
      legendDimensions,
      margin
    )}
  >
    {items.map((item, i) => {
      const { left } = legendDimensions.itemPositions[i];

      return (
        <g transform={`translate(${left},0)`} key={i}>
          <Icon {...item} />
          <text transform="translate(18,12)" fontSize="14px" fill={item.color}>
            {item.label}
          </text>
        </g>
      );
    })}
  </g>
);

export default Legend;
