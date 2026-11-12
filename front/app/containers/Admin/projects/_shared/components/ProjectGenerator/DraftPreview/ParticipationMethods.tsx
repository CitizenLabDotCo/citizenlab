import React from 'react';

import { useIntl } from 'utils/cl-intl';

import { DraftPhase } from '../draft';
import messages from '../messages';

import DraftSection from './DraftSection';
import PhaseItem from './PhaseItem';

type Props = {
  phases: DraftPhase[];
  conversationId?: string;
};

const ParticipationMethods = ({ phases, conversationId }: Props) => {
  const { formatMessage } = useIntl();

  if (phases.length === 0) return null;

  return (
    <DraftSection title={formatMessage(messages.participationMethods)}>
      {phases.map((phase) => (
        <PhaseItem
          key={phase.key}
          phase={phase}
          conversationId={conversationId}
        />
      ))}
    </DraftSection>
  );
};

export default ParticipationMethods;
