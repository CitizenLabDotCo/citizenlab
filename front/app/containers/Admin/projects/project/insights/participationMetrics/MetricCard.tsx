import React from 'react';

import {
  Box,
  Text,
  Icon,
  IconNames,
  Tooltip,
  colors,
} from '@citizenlab/cl2-component-library';
import StatTile from 'design-system/StatTile';
import DsTooltip from 'design-system/Tooltip';
import { Focusable } from 'react-aria-components';

import { SevenDayChange } from 'api/phase_insights/types';

import useProjectBackofficeRedesign from 'hooks/useProjectBackofficeRedesign';

import { useIntl } from 'utils/cl-intl';

import { usePdfExportContext } from '../pdf/PdfExportContext';

import styles from './MetricCard.module.css';
import MetricTrend from './MetricTrend';
import 'design-system/tokens.css';

interface Props {
  label: string;
  value: number | string;
  icon: IconNames;
  change?: SevenDayChange;
  valueTooltip?: string;
  labelTooltip?: string;
}

const ValueText = ({ value }: { value: string }) => (
  <Text
    as="span"
    color="primary"
    fontSize="xxxxl"
    fontWeight="bold"
    lineHeight="1.1"
    m="0"
    mt="8px"
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

  if (redesigned) {
    const labelHint =
      change !== undefined ? (
        <>
          {labelTooltip && <p className={styles.tooltipText}>{labelTooltip}</p>}
          <MetricTrend change={change} />
        </>
      ) : (
        labelTooltip
      );

    return (
      <div className={styles.panelMetric}>
        <StatTile
          label={
            labelHint ? (
              <DsTooltip content={labelHint}>
                <Focusable>
                  <span className={styles.hint} tabIndex={0}>
                    {label}
                  </span>
                </Focusable>
              </DsTooltip>
            ) : (
              label
            )
          }
          value={
            valueTooltip ? (
              <DsTooltip content={valueTooltip}>
                <Focusable>
                  <span className={styles.hint} tabIndex={0}>
                    {formattedValue}
                  </span>
                </Focusable>
              </DsTooltip>
            ) : (
              formattedValue
            )
          }
        />
      </div>
    );
  }

  return (
    <Box
      background={colors.white}
      border={`1px solid ${colors.grey100}`}
      borderRadius="8px"
      p="20px 24px 24px"
      w="200px"
      minWidth="0"
      display="flex"
      flexDirection="column"
      gap="4px"
      boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
    >
      <Tooltip content={labelTooltip} width="100%">
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
        >
          <Text fontSize="s" color="coolGrey600" m="0">
            {label}
          </Text>
          <Icon name={icon} width="20px" height="20px" fill={colors.primary} />
        </Box>
      </Tooltip>
      {valueTooltip ? (
        <Tooltip content={valueTooltip} placement="top">
          <ValueText value={formattedValue} />
        </Tooltip>
      ) : (
        <ValueText value={formattedValue} />
      )}
      {change !== undefined && <MetricTrend change={change} />}
    </Box>
  );
};

export default MetricCard;
