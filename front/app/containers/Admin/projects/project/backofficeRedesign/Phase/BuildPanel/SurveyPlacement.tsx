import React, { useState } from 'react';

import Text from 'design-system/Text';

import { IPhaseData } from 'api/phases/types';

import messages from 'containers/Admin/projects/_shared/components/PhasePlacement/messages';
import MovePhaseModal from 'containers/Admin/projects/_shared/components/PhasePlacement/MovePhaseModal';
import { canChangePlacement } from 'containers/Admin/projects/_shared/components/PhasePlacement/utils';

import { useIntl } from 'utils/cl-intl';

import PlacementCard from './PlacementCard';

interface Props {
  phase: IPhaseData;
  hasUnsavedChanges: boolean;
  onMoved: (phase: IPhaseData) => void;
}

const SurveyPlacement = ({ phase, hasUnsavedChanges, onMoved }: Props) => {
  const { formatMessage } = useIntl();
  const [opened, setOpened] = useState(false);

  if (!canChangePlacement(phase)) return null;

  return (
    <PlacementCard
      name={`survey-placement-${phase.id}`}
      value={phase.attributes.placement_type}
      disabled={hasUnsavedChanges}
      onChange={() => setOpened(true)}
    >
      {hasUnsavedChanges && (
        <Text variant="ui" tone="secondary">
          {formatMessage(messages.moveSaveChangesFirst)}
        </Text>
      )}
      {opened && (
        <MovePhaseModal
          phase={phase}
          variant="panel"
          onClose={() => setOpened(false)}
          onMoved={onMoved}
        />
      )}
    </PlacementCard>
  );
};

export default SurveyPlacement;
