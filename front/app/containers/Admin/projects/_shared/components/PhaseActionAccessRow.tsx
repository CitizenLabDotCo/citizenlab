import React from 'react';

import { Box, Icon, Text, bo, colors } from '@citizenlab/cl2-component-library';

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

const PhaseActionAccessRow = ({ phaseId, action, label }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <ToggleActionAccess phaseId={phaseId} action={action}>
      <Box display="flex" alignItems="center" gap={bo.toggleLabelGap}>
        <Box
          display="flex"
          justifyContent="center"
          width={bo.toggleWidth}
          flexShrink={0}
        >
          <Icon
            name="check"
            width="16px"
            height="16px"
            fill={colors.coolGrey600}
            ariaHidden
          />
        </Box>
        <Text as="span" variant="boControl" m="0">
          {formatMessage(label)}
        </Text>
      </Box>
    </ToggleActionAccess>
  );
};

export default PhaseActionAccessRow;
