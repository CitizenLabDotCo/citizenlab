import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import { AiAssistantConversationStatus } from 'api/ai_assistant_conversations/types';

import { useIntl } from 'utils/cl-intl';

import { DraftEvent, DraftPhase } from '../../draft';
import messages from '../../messages';

import EventRow from './EventRow';
import PhaseRow from './PhaseRow';
import TimelineMonths from './TimelineMonths';
import TimelinePlaceholder from './TimelinePlaceholder';
import { eventSpan, getTimelineScale, phaseSpan } from './timelineScale';

type Props = {
  phases: DraftPhase[];
  events: DraftEvent[];
  loading: boolean;
  projectSetUp: boolean;
  conversationId?: string;
  status?: AiAssistantConversationStatus;
};

const Timeline = ({
  phases,
  events,
  loading,
  projectSetUp,
  conversationId,
  status,
}: Props) => {
  const { formatMessage } = useIntl();
  const scale = getTimelineScale([
    ...phases.map(({ startAt, endAt }) => phaseSpan(startAt, endAt)),
    ...events.map(({ startAt, endAt }) => eventSpan(startAt, endAt)),
  ]);

  if (loading) return <TimelinePlaceholder working />;

  if (!scale) {
    return (
      <TimelinePlaceholder
        message={formatMessage(
          projectSetUp ? messages.timelinePending : messages.timelineEmpty
        )}
        working={projectSetUp && status === 'running'}
      />
    );
  }

  return (
    <Box display="flex" flexDirection="column" gap="8px">
      <TimelineMonths scale={scale} />
      {phases.map((phase) => (
        <PhaseRow
          key={phase.key}
          phase={phase}
          scale={scale}
          conversationId={conversationId}
          status={status}
        />
      ))}
      {events.length > 0 && (
        <Text m="0px" mt="12px" fontWeight="semi-bold">
          {formatMessage(messages.events)}
        </Text>
      )}
      {events.map((event) => (
        <EventRow
          key={event.key}
          event={event}
          scale={scale}
          conversationId={conversationId}
          status={status}
        />
      ))}
    </Box>
  );
};

export default Timeline;
