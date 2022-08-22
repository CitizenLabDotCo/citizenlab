import React from 'react';

// components
import { Rectangle } from './icons';

// typings
import { Item, LegendItemsSummary } from './typings';

type Position = 'bottom-left' | 'bottom-center' | 'bottom-right';

interface Props {
  items: Item[];
  legendItemsSummary: LegendItemsSummary
  parentWidth: number;
  parentHeight: number;
  position: Position;
}

const getLegendTranslate = (
  position: Position,
  parentWidth: number,
  parentHeight: number,
  { legendWidth, legendHeight }: LegendItemsSummary
) => {
  const top = parentHeight - 20;

  if (position === 'bottom-left') return `translate(8,${top})`

  if (position === 'bottom-center') {
    const left = ((parentWidth - legendWidth) / 2) + 8
    return `translate(${left},${top})`
  }

  const left = (parentWidth - legendHeight) + 8;
  return `translate(${left},${top})`
}

const Legend = ({
  items,
  legendItemsSummary,
  parentWidth,
  parentHeight,
  position,
}: Props) => (
  <g
    transform={getLegendTranslate(
      position,
      parentWidth,
      parentHeight,
      legendItemsSummary
    )}
  >
    {items.map((item, i) => {
      const { left } = legendItemsSummary.itemSizes[i];

      return (
        <g transform={`translate(${left},0)`} key={i}>
          <Rectangle fill={item.fill} />
          <text
            transform="translate(18,11)"
            fontSize="14px"
          >
            {item.label}
          </text>
        </g>
      )
    })}
  </g>
)

export default Legend;
