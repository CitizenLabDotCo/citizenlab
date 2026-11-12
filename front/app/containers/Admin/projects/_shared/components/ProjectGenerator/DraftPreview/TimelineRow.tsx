import React from 'react';

import { Box, Text, colors } from '@citizenlab/cl2-component-library';

import useLocalize from 'hooks/useLocalize';

import { DraftPhase } from '../draft';

import TimelineBar from './TimelineBar';
import { TimelineScale, phaseSpan } from './timelineScale';
import usePhaseLabels from './usePhaseLabels';

type Props = {
  phase: DraftPhase;
  scale: TimelineScale;
  color: string;
};

const TimelineRow = ({ phase, scale, color }: Props) => {
  const localize = useLocalize();
  const { datesOf } = usePhaseLabels();
  const removed = phase.change?.kind === 'remove';

  return (
    <Box display="flex" alignItems="center" gap="12px">
      <Box flex="0 0 130px" minWidth="0">
        <Text
          m="0px"
          fontSize="s"
          overflow="hidden"
          whiteSpace="nowrap"
          textOverflow="ellipsis"
          textDecoration={removed ? 'line-through' : undefined}
        >
          {localize(phase.title)}
        </Text>
      </Box>
      <TimelineBar
        scale={scale}
        span={phaseSpan(phase.startAt, phase.endAt)}
        color={removed ? colors.red400 : color}
      />
      <Box flexShrink={0}>
        <Text m="0px" fontSize="s" color="textSecondary" whiteSpace="nowrap">
          {datesOf(phase)}
        </Text>
      </Box>
    </Box>
  );
};

export default TimelineRow;
