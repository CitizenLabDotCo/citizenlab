import React from 'react';

import { Box, Icon, colors } from '@citizenlab/cl2-component-library';

import { IPermissionsCustomFieldData } from 'api/permissions_custom_fields/types';
import { PermittedBy } from 'api/phase_permissions/types';

import Blocks from './Blocks';
import Edge from './Blocks/Edge';

interface Props {
  permittedBy: PermittedBy;
  verificationEnabled: boolean;
  permissionsCustomFields: IPermissionsCustomFieldData[];
}

const FlowVisualization = ({
  permittedBy,
  verificationEnabled,
  permissionsCustomFields,
}: Props) => {
  return (
    <Box display="flex" flexDirection="row">
      <Blocks
        permittedBy={permittedBy}
        permissionsCustomFields={permissionsCustomFields}
        verificationEnabled={verificationEnabled}
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
