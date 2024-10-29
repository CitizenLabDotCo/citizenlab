import React from 'react';

import {
  Text,
  Tooltip,
  Box,
  Icon,
  colors,
} from '@citizenlab/cl2-component-library';

import { CustomLegendProps } from 'components/admin/Graphs/StackedBarChart/typings';

const DemographicsLegend = ({ items, legendDimensions }: CustomLegendProps) => {
  return (
    <Box w={`${legendDimensions.width}px`}>
      <Box
        position="absolute"
        top="8px"
        display="flex"
        justifyContent="center"
        alignItems="center"
        width="100%"
        flexWrap="wrap"
        margin="0 auto"
      >
        {/* TODO: Fix this the next time the file is edited. */}
        {/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */}
        {items &&
          items.map((item, index) => {
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            const isZeroValue = item?.value === 0;
            const color = isZeroValue ? colors.coolGrey300 : item.color;

            return (
              <Tooltip
                key={index}
                theme="dark"
                content={
                  <Box>
                    <Text fontWeight="bold" m="0px" color="white" fontSize="s">
                      0%
                    </Text>
                  </Box>
                }
                disabled={!isZeroValue}
              >
                <Box
                  display="flex"
                  alignItems="center"
                  marginRight="0.5rem"
                  style={{
                    cursor: isZeroValue ? 'pointer' : 'default',
                    color,
                  }}
                >
                  <Icon
                    name="dot"
                    fill={color || item.color}
                    width="10px"
                    height="10px"
                  />
                  <Text
                    m="0px"
                    style={{
                      marginLeft: '0.5rem',
                      fontSize: '14px',
                      color: isZeroValue ? colors.coolGrey300 : undefined,
                    }}
                    whiteSpace="nowrap"
                  >
                    {item.label}
                  </Text>
                </Box>
              </Tooltip>
            );
          })}
      </Box>
    </Box>
  );
};

export default DemographicsLegend;
