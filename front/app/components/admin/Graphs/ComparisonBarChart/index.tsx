import React, { useMemo } from 'react';

import { Box, colors, Text } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { useIntl } from 'utils/cl-intl';

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

const BarFill = styled(Box)<{
  percentage: number;
  color: string;
  opacity: number;
}>`
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: ${({ percentage }) => percentage}%;
  background: ${({ color }) => color};
  opacity: ${({ opacity }) => opacity};
  border-radius: 3px;

  @media print {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
`;

const PercentageLabel = styled.span<{ color: string }>`
  font-size: 14px;
  line-height: 1.5;
  color: ${({ color }) => color};
  margin: 0;
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
  const { formatNumber } = useIntl();
  const noData = hasNoData(data);

  const formatPercentageValue = (value: number) => {
    return formatNumber(value / 100, {
      style: 'percent',
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    });
  };

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
      gap="16px"
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
                  <PercentageLabel color={fill}>
                    {formatPercentageValue(payload.primaryValue)}
                  </PercentageLabel>
                )}
                {showComparison &&
                  payload.comparisonValue !== undefined &&
                  payload.comparisonValue > 0 && (
                    <PercentageLabel color={comparisonColor}>
                      {formatPercentageValue(payload.comparisonValue)}
                    </PercentageLabel>
                  )}
              </Box>
            </Box>

            <BarContainer style={{ height: `${barHeight}px` }}>
              <Box display="flex" flexDirection="column" h="100%">
                <Box
                  h={showComparison ? '50%' : '100%'}
                  w="100%"
                  position="relative"
                >
                  <BarFill
                    percentage={payload.primaryValue}
                    color={fill}
                    opacity={opacity}
                  />
                </Box>
                {showComparison &&
                  payload.comparisonValue !== undefined &&
                  payload.comparisonValue > 0 && (
                    <Box h="50%" w="100%" position="relative">
                      <BarFill
                        percentage={payload.comparisonValue}
                        color={comparisonColor}
                        opacity={1}
                      />
                    </Box>
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
