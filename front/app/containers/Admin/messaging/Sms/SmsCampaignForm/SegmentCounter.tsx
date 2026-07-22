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
import { MAX_SMS_SEGMENTS } from 'utils/sms/segments';
import useSmsSegments from 'utils/sms/useSmsSegments';

import messages from '../../messages';

// Sits in the corner of the field, where the subject field's counter already sits.
const Container = styled.div`
  position: absolute;
  right: 10px;
  bottom: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  // The field's own text can run underneath, so the counter carries the field's ground.
  background: ${colors.white};
  padding-left: 6px;
`;

// Tabular figures so the digits do not shuffle sideways on every keystroke.
const Readout = styled.span<{ overLimit: boolean }>`
  font-size: ${fontSizes.s}px;
  font-variant-numeric: tabular-nums;
  color: ${({ overLimit }) =>
    overLimit ? colors.red600 : colors.textSecondary};
  font-weight: ${({ overLimit }) => (overLimit ? 600 : 400)};
`;

// The cost of the message. Neutral until a second segment is committed to.
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
  // The body of the locale currently shown in the field.
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
