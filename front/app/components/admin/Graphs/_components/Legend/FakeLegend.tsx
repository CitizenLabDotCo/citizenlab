import React, { useState, useEffect } from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';
import Icon from './Icon';

// utils
import { getJustifyContent, getLegendDimensions } from './utils';

// typings
import { Position, LegendItem, LegendDimensions } from './typings';

interface Props {
  items: LegendItem[][];
  position?: Position;
  onCalculateDimensions: (dimensions: LegendDimensions) => void;
}

let idNumber = 0;

const getId = () => {
  const id = `_fake-legend-${idNumber}`;
  idNumber++;
  return id;
};

const FakeLegend = ({
  items,
  position = 'bottom-center',
  onCalculateDimensions,
}: Props) => {
  const [id, setId] = useState<string | undefined>();

  useEffect(() => {
    setId(getId());
  }, []);

  useEffect(() => {
    if (id === undefined) return;
    const itemRows = [
      ...document.querySelectorAll(`#${id} > .fake-legend-row`),
    ];

    const legendDimensions = getLegendDimensions(itemRows);
    onCalculateDimensions(legendDimensions);
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
          justifyContent={getJustifyContent(position)}
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
