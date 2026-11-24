import React from 'react';

import {
  Box,
  Text,
  Icon,
  IconNames,
  Tooltip,
  colors,
  bo,
} from '@citizenlab/cl2-component-library';

import { SevenDayChange } from 'api/phase_insights/types';

import useProjectBackofficeRedesign from 'hooks/useProjectBackofficeRedesign';

import { useIntl } from 'utils/cl-intl';

import { usePdfExportContext } from '../pdf/PdfExportContext';

import MetricTrend from './MetricTrend';

interface Props {
  label: string;
  value: number | string;
  icon: IconNames;
  change?: SevenDayChange;
  valueTooltip?: string;
  labelTooltip?: string;
}

const ValueText = ({ value, compact }: { value: string; compact: boolean }) => (
  <Text
    as="span"
    color="primary"
    fontSize={compact ? 'xxl' : 'xxxxl'}
    fontWeight={compact ? 'semi-bold' : 'bold'}
    lineHeight="1.1"
    m="0"
    mt={compact ? '4px' : '8px'}
    mb="4px"
  >
    {value}
  </Text>
);

const MetricCard = ({
  label,
  value,
  icon,
  change,
  labelTooltip,
  valueTooltip,
}: Props) => {
  const { formatNumber } = useIntl();
  const redesignEnabled = useProjectBackofficeRedesign();
  const { isPdfRenderMode } = usePdfExportContext();
  const redesigned = redesignEnabled && !isPdfRenderMode;
  const formattedValue =
    typeof value === 'number' ? formatNumber(value) : value;

  const labelHint =
    redesigned && change !== undefined ? (
      <Box>
        {labelTooltip && <Text m="0">{labelTooltip}</Text>}
        <MetricTrend change={change} />
      </Box>
    ) : (
      labelTooltip
    );

  return (
    <Box
      background={colors.white}
      border={`1px solid ${colors.grey100}`}
      borderRadius={redesigned ? bo.borderRadius : '8px'}
      p={redesigned ? '12px' : '20px 24px 24px'}
      w={redesigned ? undefined : '200px'}
      flex={redesigned ? '1 1 80px' : undefined}
      minWidth={redesigned ? '80px' : '0'}
      display="flex"
      flexDirection="column"
      gap="4px"
      boxShadow={
        redesigned
          ? undefined
          : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }
    >
      <Tooltip content={labelHint} width="100%">
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
        >
          <Text fontSize={redesigned ? 'xs' : 's'} color="coolGrey600" m="0">
            {label}
          </Text>
          {!redesigned && (
            <Icon
              name={icon}
              width="20px"
              height="20px"
              fill={colors.primary}
            />
          )}
        </Box>
      </Tooltip>
      {valueTooltip ? (
        <Tooltip content={valueTooltip} placement="top">
          <ValueText value={formattedValue} compact={redesigned} />
        </Tooltip>
      ) : (
        <ValueText value={formattedValue} compact={redesigned} />
      )}
      {!redesigned && change !== undefined && <MetricTrend change={change} />}
    </Box>
  );
};

export default MetricCard;
