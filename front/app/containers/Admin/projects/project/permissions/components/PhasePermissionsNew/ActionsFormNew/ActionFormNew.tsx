import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { IPermissionData } from 'api/permissions/types';
import { PermittedBy } from 'api/phase_permissions/types';

import AdminCollaboratorToggle from 'components/admin/ActionsForm/AdminCollaboratorToggle';

import CardButtons from './CardButtons';

interface Props {
  permissionData: IPermissionData;
  groupIds?: string[];
  phaseType: 'defaultInput' | 'nativeSurvey';
  onChange: (
    permittedBy:
      | IPermissionData['attributes']['permitted_by']
      | IPermissionData['attributes']['global_custom_fields'],
    groupIds: Props['groupIds']
  ) => void;
}

const ActionFormNew = ({
  permissionData,
  groupIds,
  phaseType,
  onChange,
}: Props) => {
  const handlePermittedByUpdate = (permittedBy: PermittedBy) => {
    onChange(permittedBy, []); // TODO
  };

  const {
    id: permissionId,
    attributes: { permitted_by: permittedBy, action },
  } = permissionData;

  const isSurveyAction =
    phaseType === 'nativeSurvey' && action === 'posting_idea';

  return (
    <form>
      <Box mb="20px">
        <AdminCollaboratorToggle
          enabled={permittedBy === 'admins_moderators'}
          id={`participation-permission-admins-${permissionId}`}
          onChange={() => {
            handlePermittedByUpdate(
              permittedBy === 'admins_moderators'
                ? 'users'
                : 'admins_moderators'
            );
          }}
        />
      </Box>
      {permittedBy !== 'admins_moderators' && (
        <Box display="flex" gap="16px">
          <CardButtons
            isSurveyAction={isSurveyAction}
            permittedBy={permittedBy}
            onUpdate={handlePermittedByUpdate}
          />
        </Box>
      )}
      <Box>TODO</Box>
    </form>
  );
};

export default ActionFormNew;
