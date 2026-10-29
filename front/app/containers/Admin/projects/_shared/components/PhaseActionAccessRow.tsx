import React from 'react';

import { Text } from '@citizenlab/cl2-component-library';

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

const LABEL_INDENT = '36px';

const PhaseActionAccessRow = ({ phaseId, action, label }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <ToggleActionAccess phaseId={phaseId} action={action}>
      <Text as="span" variant="boControl" m="0" pl={LABEL_INDENT}>
        {formatMessage(label)}
      </Text>
    </ToggleActionAccess>
  );
};

export default PhaseActionAccessRow;
