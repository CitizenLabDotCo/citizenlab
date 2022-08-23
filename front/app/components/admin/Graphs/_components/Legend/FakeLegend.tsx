import React, { useEffect } from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';
import Icon from './Icon';

// typings
import { Item, LegendDimensions } from './typings';

interface Props {
  items: Item[];
  onCalculateDimensions: (dimensions: LegendDimensions) => void;
}

const FakeLegend = ({ items, onCalculateDimensions }: Props) => {
  useEffect(() => {
    const legendElements = document.getElementsByClassName('fake-legend-item');
    if (legendElements.length === 0) return;

    const legendDimensionsAcc: LegendDimensions = {
      width: 0,
      height: 0,
      itemPositions: [],
    };

    const legendDimensions = [...legendElements].reduce(
      (acc, { clientWidth, clientHeight }) => {
        acc.itemPositions.push({
          left: acc.width,
        });

        acc.width += clientWidth;
        acc.height = Math.max(acc.height, clientHeight);

        return acc;
      },
      legendDimensionsAcc
    );

    onCalculateDimensions(legendDimensions);
  }, [items, onCalculateDimensions]);

  return (
    <Box
      style={{ visibility: 'hidden' }}
      width="100%"
      display="flex"
      flexDirection="row"
    >
      {items.map((item, i) => (
        <Box
          className="fake-legend-item"
          display="flex"
          flexDirection="row"
          alignItems="center"
          px="8px"
          key={i}
        >
          <svg width="14px" height="14px" style={{ marginRight: '4px' }}>
            <Icon {...item} />
          </svg>

          <Box style={{ fontSize: '14px' }} display="flex" alignItems="center">
            {item.label}
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default FakeLegend;
