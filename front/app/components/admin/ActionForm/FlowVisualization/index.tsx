import React from 'react';

import { Box, Icon, colors } from '@citizenlab/cl2-component-library';

import { Action } from 'api/permissions/types';
import usePermissionsCustomFields from 'api/permissions_custom_fields/usePermissionsCustomFields';
import { PermittedBy } from 'api/phase_permissions/types';

import Blocks from './Blocks';
import Edge from './Blocks/Edge';

interface Props {
  permittedBy: PermittedBy;
  phaseId?: string;
  action: Action;
}

const FlowVisualization = ({ permittedBy, phaseId, action }: Props) => {
  const { data: permissionsCustomFields } = usePermissionsCustomFields({
    phaseId,
    action,
  });

  if (!permissionsCustomFields) return null;

  return (
    <Box display="flex" flexDirection="row">
      <Blocks
        permittedBy={permittedBy}
        permissionsCustomFields={permissionsCustomFields.data}
      />
      <Edge />
      <Box display="flex" alignItems="center">
        <Box
          bgColor={colors.green100}
          border={`1px solid ${colors.green700}`}
          w="40px"
          h="40px"
          borderRadius="20px"
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <Icon name="check" fill={colors.green700} />
        </Box>
      </Box>
    </Box>
  );
};

export default FlowVisualization;
