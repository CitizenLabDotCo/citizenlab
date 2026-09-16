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
}

const ParticipantActionsGroup = ({ phaseId, actions }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <PanelGroup
      label={formatMessage(configMessages.participantActionsGroup)}
      defaultOpen
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
