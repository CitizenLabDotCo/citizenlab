import React from 'react';

import {
  Box,
  colors,
  fontSizes,
  IconTooltip,
  Tooltip,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { useIntl } from 'utils/cl-intl';

import messages from '../../messages';
import { MAX_SMS_SEGMENTS } from '../utils/segments';

import useSmsSegments from './useSmsSegments';

const Container = styled.div`
  position: absolute;
  right: 10px;
  bottom: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  // Opaque so the field's text doesn't show through.
  background: ${colors.white};
  padding-left: 6px;
`;

// Tabular figures so digits don't shift while typing.
const Readout = styled.span<{ overLimit: boolean }>`
  font-size: ${fontSizes.s}px;
  font-variant-numeric: tabular-nums;
  color: ${({ overLimit }) =>
    overLimit ? colors.red600 : colors.textSecondary};
  font-weight: ${({ overLimit }) => (overLimit ? 600 : 400)};
`;

const Pill = styled.span<{ segmentCount: number; overLimit: boolean }>`
  font-size: ${fontSizes.xs}px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  padding: 2px 8px;
  border-radius: 5px;
  cursor: help;

  ${({ segmentCount, overLimit }) => {
    if (overLimit) {
      return `background: ${colors.red100}; color: ${colors.red600};`;
    }
    if (segmentCount > 1) {
      return `background: ${colors.orange100}; color: ${colors.orange500};`;
    }
    return `background: ${colors.grey200}; color: ${colors.textSecondary};`;
  }}
`;

interface Props {
  body: string;
}

const SegmentCounter = ({ body }: Props) => {
  const { formatMessage } = useIntl();

  const {
    unitsUsed,
    capacity,
    perSegment,
    segmentCount,
    isUnicode,
    nonGsmCharacters,
    exceedsLimit,
  } = useSmsSegments(body);

  const costTooltip = exceedsLimit
    ? formatMessage(messages.smsSegmentCostOverLimit, {
        segmentCount,
        maxSegments: MAX_SMS_SEGMENTS,
      })
    : formatMessage(messages.smsSegmentCost, { segmentCount });

  return (
    <Container data-testid="sms-segment-counter">
      <Readout overLimit={exceedsLimit} data-testid="sms-segment-readout">
        {unitsUsed} / {capacity}
      </Readout>

      <Tooltip content={costTooltip} placement="top" theme="dark">
        <Pill
          segmentCount={segmentCount}
          overLimit={exceedsLimit}
          tabIndex={0}
          data-testid="sms-segment-pill"
        >
          {formatMessage(messages.smsSegmentPill, { segmentCount })}
        </Pill>
      </Tooltip>
      {isUnicode && (
        <Box data-testid="sms-segment-encoding-warning">
          <IconTooltip
            icon="alert-circle"
            iconColor={colors.orange500}
            iconSize="18px"
            placement="top"
            content={formatMessage(messages.smsSegmentEncodingWarning, {
              characters: nonGsmCharacters.join(' '),
              perSegment,
              gsmPerSegment: segmentCount === 1 ? 160 : 153,
            })}
          />
        </Box>
      )}
    </Container>
  );
};

export default SegmentCounter;
