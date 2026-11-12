import React from 'react';

import { Box, Text, colors } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import { DraftPhase } from '../draft';
import messages from '../messages';

import DraftItem from './DraftItem';
import DraftSection from './DraftSection';
import TimelineRow from './TimelineRow';
import { getTimelineScale, phaseSpan } from './timelineScale';

// Cycled across the phases, so each bar reads as its own step.
const BAR_COLORS = [colors.teal300, colors.teal500, colors.teal700];

type Props = {
  phases: DraftPhase[];
};

const Timeline = ({ phases }: Props) => {
  const { formatMessage } = useIntl();
  const scale = getTimelineScale(
    phases.map(({ startAt, endAt }) => phaseSpan(startAt, endAt))
  );

  return (
    <DraftSection title={formatMessage(messages.timeline)}>
      <DraftItem pending={false}>
        <Box p="20px 24px" display="flex" flexDirection="column" gap="14px">
          {scale ? (
            phases.map((phase, index) => (
              <TimelineRow
                key={phase.key}
                phase={phase}
                scale={scale}
                color={BAR_COLORS[index % BAR_COLORS.length]}
              />
            ))
          ) : (
            <Text m="0px" color="textSecondary">
              {formatMessage(messages.noPhases)}
            </Text>
          )}
        </Box>
      </DraftItem>
    </DraftSection>
  );
};

export default Timeline;
