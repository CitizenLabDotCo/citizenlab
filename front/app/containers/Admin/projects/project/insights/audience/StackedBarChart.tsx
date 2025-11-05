import React from 'react';

import { Box, Text } from 'component-library';
import styled from 'styled-components';

import { DemographicDataPoint } from 'api/phase_insights/types';

// Stacked bar showing participant vs population percentages
const BarContainer = styled(Box)`
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  height: 16px;
  width: 100%;
  overflow: hidden;
  position: relative;
`;

const BarRow = styled(Box)<{ isFullHeight?: boolean }>`
  height: ${({ isFullHeight }) => (isFullHeight ? '100%' : '50%')};
  width: 100%;
  overflow: hidden;
  position: relative;
`;

const BarFill = styled(Box)<{
  percentage: number;
  color: string;
  isFullHeight?: boolean;
}>`
  position: absolute;
  left: 1px;
  top: 1px;
  height: ${({ isFullHeight }) => (isFullHeight ? '14px' : '7px')};
  width: calc(${({ percentage }) => percentage}% - 2px);
  background: ${({ color }) => color};
`;

const LegendDot = styled(Box)<{ color: string }>`
  width: 8px;
  height: 8px;
  background: ${({ color }) => color};
  border-radius: 50%;
`;

interface Props {
  data: DemographicDataPoint[];
  showRepresentativeness?: boolean;
}

const StackedBarChart: React.FC<Props> = ({
  data,
  showRepresentativeness = true,
}) => {
  return (
    <Box display="flex" flexDirection="column" gap="8px">
      {data.map((item) => (
        <Box key={item.key} display="flex" flexDirection="column" gap="8px">
          {/* Category label and percentages */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Text fontSize="m" color="textPrimary" m="0px">
              {item.label}
            </Text>
            <Box display="flex" gap="12px" alignItems="center">
              <Box display="flex" gap="8px" alignItems="center">
                <LegendDot color="#2f478a" />
                <Text fontSize="s" color="coolGrey700" m="0px">
                  {item.percentage}%
                </Text>
              </Box>
              {showRepresentativeness &&
                item.population_percentage !== undefined && (
                  <Box display="flex" gap="8px" alignItems="center">
                    <LegendDot color="#40b8c5" />
                    <Text fontSize="s" color="coolGrey700" m="0px">
                      {item.population_percentage}%
                    </Text>
                  </Box>
                )}
            </Box>
          </Box>

          {/* Stacked bar chart */}
          <BarContainer>
            <Box display="flex" flexDirection="column" h="100%">
              {/* Participants bar */}
              <BarRow isFullHeight={!showRepresentativeness}>
                <BarFill
                  percentage={item.percentage}
                  color="#2f478a"
                  isFullHeight={!showRepresentativeness}
                />
              </BarRow>
              {/* Population bar */}
              {showRepresentativeness &&
                item.population_percentage !== undefined && (
                  <BarRow>
                    <BarFill
                      percentage={item.population_percentage}
                      color="#40b8c5"
                    />
                  </BarRow>
                )}
            </Box>
          </BarContainer>
        </Box>
      ))}

      {/* Legend at bottom */}
      <Box display="flex" gap="12px" mt="8px">
        <Box display="flex" gap="8px" alignItems="center">
          <LegendDot color="#2f478a" />
          <Text fontSize="s" color="coolGrey700" m="0px">
            Participants
          </Text>
        </Box>
        {showRepresentativeness && (
          <Box display="flex" gap="8px" alignItems="center">
            <LegendDot color="#40b8c5" />
            <Text fontSize="s" color="coolGrey700" m="0px">
              Total population
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default StackedBarChart;
