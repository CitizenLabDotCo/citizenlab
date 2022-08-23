import React, { useState, useEffect } from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';
import Icon from './Icon';

// typings
import { LegendItem, ItemPosition, LegendDimensions } from './typings';

interface Props {
  items: LegendItem[][];
  onCalculateDimensions: (dimensions: LegendDimensions) => void;
}

let idNumber = 0;

const getId = () => {
  const id = `_fake-legend-${idNumber}`;
  idNumber++;
  return id;
};

const FakeLegend = ({ items, onCalculateDimensions }: Props) => {
  const [id, setId] = useState<string | undefined>();

  useEffect(() => {
    setId(getId());
  }, []);

  useEffect(() => {
    if (id === undefined) return;
    const itemRows = [
      ...document.querySelectorAll(`#${id} > .fake-legend-row`),
    ];

    const corner = itemRows.reduce(
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

    onCalculateDimensions({ width, height, itemPositions });
  }, [id, items, onCalculateDimensions]);

  return (
    <Box
      style={{ visibility: 'hidden' }}
      display="flex"
      flexDirection="column"
      id={id}
    >
      {items.map((itemRow, rowIndex) => (
        <Box
          display="flex"
          flexDirection="row"
          justifyContent="center"
          className="fake-legend-row"
          key={rowIndex}
        >
          {itemRow.map((item, itemIndex) => (
            <Box
              className="fake-legend-item"
              display="flex"
              flexDirection="row"
              alignItems="center"
              px="8px"
              key={`${rowIndex}-${itemIndex}`}
            >
              <svg width="14px" height="14px" style={{ marginRight: '4px' }}>
                <Icon {...item} />
              </svg>

              <Box
                style={{ fontSize: '14px' }}
                display="flex"
                alignItems="center"
              >
                {item.label}
              </Box>
            </Box>
          ))}
        </Box>
      ))}
    </Box>
  );
};

export default FakeLegend;
