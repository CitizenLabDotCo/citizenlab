import React from 'react';

import PhaseActionAccessRow, {
  AccessOnlyAction,
} from 'containers/Admin/projects/_shared/components/PhaseActionAccessRow';
import PanelGroup from 'containers/Admin/projects/_shared/components/SettingsPanel/PanelGroup';
import configMessages from 'containers/Admin/projects/project/phaseSetup/components/PhaseParticipationConfig/messages';

import { useIntl } from 'utils/cl-intl';

interface Props {
  phaseId: string;
  actions: AccessOnlyAction[];
  summary?: string;
}

const ParticipantActionsGroup = ({ phaseId, actions, summary }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <PanelGroup
      label={formatMessage(configMessages.participantActionsGroup)}
      reviewKey="participant_actions"
      summary={summary}
    >
      {actions.map(({ action, label }) => (
        <PhaseActionAccessRow
          key={action}
          phaseId={phaseId}
          action={action}
          label={label}
        />
      ))}
    </PanelGroup>
  );
};

export default ParticipantActionsGroup;
