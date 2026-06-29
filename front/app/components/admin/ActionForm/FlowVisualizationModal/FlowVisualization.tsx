import React from 'react';

import { Box, Icon, colors } from '@citizenlab/cl2-component-library';

import usePermissionsPhaseCustomFields from 'api/permissions_phase_custom_fields/usePermissionsPhaseCustomFields';
import { IPhasePermissionData } from 'api/phase_permissions/types';

import Blocks from './Blocks';
import Edge from './Blocks/Edge';

interface Props {
  permission: IPhasePermissionData;
  phaseId: string;
}

const FlowVisualization = ({
  permission,
  phaseId
}: Props) => {
  const {
    permitted_by,
    action,
    user_fields_in_form_descriptor
  } = permission.attributes;

  const { data: permissionFields } = usePermissionsPhaseCustomFields({
    phaseId,
    action,
  });

  return (
    <Box display="flex" flexDirection="row">
      <Blocks
        permittedBy={permitted_by}
        permissionsCustomFields={permissionFields?.data ?? []}
        verificationEnabled={verificationEnabled}
        userFieldsInForm={user_fields_in_form_descriptor.value}
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
