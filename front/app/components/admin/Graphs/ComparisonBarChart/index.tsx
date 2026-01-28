import React, { useMemo } from 'react';

import { Box, colors, Text } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import EmptyState from '../_components/EmptyState';
import { hasNoData } from '../utils';

import { Props, Payload } from './typings';
import { convertData, getBarFill, getBarOpacity } from './utils';

const BarContainer = styled(Box)`
  border: 1px solid ${colors.divider};
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
  opacity: number;
  isFullHeight?: boolean;
}>`
  position: absolute;
  left: 1px;
  top: 1px;
  height: ${({ isFullHeight }) => (isFullHeight ? '14px' : '7px')};
  width: calc(${({ percentage }) => percentage}% - 2px);
  background: ${({ color }) => color};
  opacity: ${({ opacity }) => opacity};

  @media print {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
`;

const ComparisonBarChart = <Row,>({
  data,
  mapping,
  showComparison = true,
  primaryColor = colors.blue700,
  comparisonColor = colors.teal300,
  barHeight = 16,
  width,
  height,
  emptyContainerContent,
  innerRef,
  onMouseOver,
  onMouseOut,
  ariaLabel,
  ariaDescribedBy,
}: Props<Row>) => {
  const noData = hasNoData(data);

  const chartData = useMemo(() => {
    if (noData) return [];
    return convertData(data, mapping);
  }, [data, mapping, noData]);

  if (noData) {
    return <EmptyState emptyContainerContent={emptyContainerContent} />;
  }

  return (
    <Box
      ref={innerRef}
      display="flex"
      flexDirection="column"
      gap="8px"
      width={typeof width === 'number' ? `${width}px` : width}
      height={typeof height === 'number' ? `${height}px` : height}
      role="img"
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      tabIndex={0}
    >
      {chartData.map((payload: Payload<Row>) => {
        const fill = getBarFill(payload, mapping, primaryColor);
        const opacity = getBarOpacity(payload, mapping);

        return (
          <Box
            key={payload.rowIndex}
            display="flex"
            flexDirection="column"
            gap="8px"
            onMouseOver={(e) => onMouseOver?.(payload, e)}
            onMouseOut={(e) => onMouseOut?.(payload, e)}
          >
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Text fontSize="m" color="textPrimary" m="0px">
                {payload.category}
              </Text>
              <Box display="flex" gap="12px" alignItems="center">
                {payload.primaryValue > 0 && (
                  <Text fontSize="s" color="coolGrey700" m="0px">
                    {payload.primaryValue}%
                  </Text>
                )}
                {showComparison &&
                  payload.comparisonValue !== undefined &&
                  payload.comparisonValue > 0 && (
                    <Text fontSize="s" color="coolGrey700" m="0px">
                      {payload.comparisonValue}%
                    </Text>
                  )}
              </Box>
            </Box>

            <BarContainer style={{ height: `${barHeight}px` }}>
              <Box display="flex" flexDirection="column" h="100%">
                <BarRow isFullHeight={!showComparison}>
                  <BarFill
                    percentage={payload.primaryValue}
                    color={fill}
                    opacity={opacity}
                    isFullHeight={!showComparison}
                  />
                </BarRow>
                {showComparison &&
                  payload.comparisonValue !== undefined &&
                  payload.comparisonValue > 0 && (
                    <BarRow>
                      <BarFill
                        percentage={payload.comparisonValue}
                        color={comparisonColor}
                        opacity={1}
                      />
                    </BarRow>
                  )}
              </Box>
            </BarContainer>
          </Box>
        );
      })}
    </Box>
  );
};

export default ComparisonBarChart;
