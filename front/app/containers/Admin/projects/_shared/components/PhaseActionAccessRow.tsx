import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import { IPhasePermissionAction } from 'api/permissions/types';

import { MessageDescriptor, useIntl } from 'utils/cl-intl';

import PhaseActionAccess from './PhaseActionAccess';

export interface AccessOnlyAction {
  action: IPhasePermissionAction;
  label: MessageDescriptor;
}

interface Props extends AccessOnlyAction {
  phaseId: string;
}

const PhaseActionAccessRow = ({ phaseId, action, label }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Box mb="12px">
      <Text m="0" fontSize="s" color="primary">
        {formatMessage(label)}
      </Text>
      <PhaseActionAccess phaseId={phaseId} action={action} />
    </Box>
  );
};

export default PhaseActionAccessRow;
