import React from 'react';

// components
import Icon from './Icon';

// typings
import { Item, LegendItemsDimensions, Position } from './typings';
import { Margin } from '../../typings';

interface Props {
  items: Item[];
  legendItemsDimensions: LegendItemsDimensions
  graphWidth: number;
  graphHeight: number;
  position: Position;
  margin?: Margin;
}

const getLegendTranslate = (
  position: Position,
  graphWidth: number,
  graphHeight: number,
  { legendWidth, legendHeight }: LegendItemsDimensions,
  margin?: Margin
) => {
  const top = (graphHeight - legendHeight) - (margin?.bottom ?? 0);

  if (position === 'bottom-left') return `translate(8,${top})`

  if (position === 'bottom-center') {
    const left = ((graphWidth - legendWidth) / 2) + 8
    return `translate(${left},${top})`
  }

  const left = (graphWidth - legendWidth) + 8;
  return `translate(${left},${top})`
}

const Legend = ({
  items,
  legendItemsDimensions,
  graphWidth,
  graphHeight,
  position,
  margin,
}: Props) => (
  <g
    transform={getLegendTranslate(
      position,
      graphWidth,
      graphHeight,
      legendItemsDimensions,
      margin
    )}
  >
    {items.map((item, i) => {
      const { left } = legendItemsDimensions.itemSizes[i];

      return (
        <g transform={`translate(${left},0)`} key={i}>
          <Icon {...item} />
          <text
            transform="translate(18,12)"
            fontSize="14px"
            fill={item.color}
          >
            {item.label}
          </text>
        </g>
      )
    })}
  </g>
)

export default Legend;
