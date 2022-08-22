import React, { useEffect } from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';
import { Rectangle } from './icons';

// typings
import { Item, LegendItemsSummary } from './typings';

interface Props {
  items: Item[];
  show?: boolean;
  onCalculateDimensions: (summary: LegendItemsSummary) => void;
}

const FakeLegend = ({ items, show, onCalculateDimensions }: Props) => {
  useEffect(() => {
    const legendElements = document.getElementsByClassName('fake-legend-item');
    if (legendElements.length === 0) return;
    
    const legendItemsSummaryAcc: LegendItemsSummary = {
      legendWidth: 0,
      legendHeight: 0,
      itemSizes: []
    }
  
    const legendItemsSummary = [...legendElements].reduce((acc, { clientWidth, clientHeight }) => {
      acc.itemSizes.push({
        left: acc.legendWidth,
        width: clientWidth,
        height: clientHeight
      });

      acc.legendWidth += clientWidth;
      acc.legendHeight = Math.max(acc.legendHeight, clientHeight);

      return acc;
    }, legendItemsSummaryAcc);

    onCalculateDimensions(legendItemsSummary);
  }, [items])

  return (
    <Box
      style={{ visibility: show ? 'visible' : 'hidden' }}
      width="5000px"
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
            <Rectangle fill={item.fill} />
          </svg>

          <Box style={{ fontSize: '14px' }} display="flex" alignItems="center">
            {item.label}
          </Box>
        </Box>       
      ))}
    </Box>
  )
}

export default FakeLegend;
