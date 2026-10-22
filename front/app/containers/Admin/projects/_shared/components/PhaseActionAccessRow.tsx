import React from 'react';

import { Text, Toggle } from '@citizenlab/cl2-component-library';

import { IPhasePermissionAction } from 'api/permissions/types';

import { MessageDescriptor, useIntl } from 'utils/cl-intl';

import ToggleActionAccess from './ToggleActionAccess';

export interface AccessOnlyAction {
  action: IPhasePermissionAction;
  label: MessageDescriptor;
}

interface Props extends AccessOnlyAction {
  phaseId: string;
}

// These actions can't be switched off for a phase, so their toggle only
// shows that they are always on, next to the ones that can.
const PhaseActionAccessRow = ({ phaseId, action, label }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <ToggleActionAccess phaseId={phaseId} action={action}>
      <Toggle
        size="small"
        checked
        disabled
        onChange={() => {}}
        label={
          <Text as="span" variant="boControl" m="0">
            {formatMessage(label)}
          </Text>
        }
      />
    </ToggleActionAccess>
  );
};

export default PhaseActionAccessRow;
