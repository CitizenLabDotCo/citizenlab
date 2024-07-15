import React from 'react';

import { Box, Title } from '@citizenlab/cl2-component-library';

import { IPhasePermissionData } from 'api/permissions/types';
import { PermittedBy } from 'api/phase_permissions/types';

import AdminCollaboratorToggle from 'components/admin/ActionsForm/AdminCollaboratorToggle';
import GroupSelect from 'components/admin/ActionsForm/GroupSelect';

import { FormattedMessage } from 'utils/cl-intl';

import CardButtons from './CardButtons';
import Fields from './Fields';
import messages from './messages';

interface Props {
  phaseId: string;
  permissionData: IPhasePermissionData;
  groupIds?: string[];
  phaseType: 'defaultInput' | 'nativeSurvey';
  onChange: (
    permittedBy:
      | IPhasePermissionData['attributes']['permitted_by']
      | IPhasePermissionData['attributes']['global_custom_fields'],
    groupIds: Props['groupIds']
  ) => void;
}

const showGroupSelect = (permittedBy: PermittedBy) => {
  return permittedBy !== 'everyone' && permittedBy !== 'admins_moderators';
};

const ActionFormNew = ({
  phaseId,
  permissionData,
  groupIds,
  phaseType,
  onChange,
}: Props) => {
  const handlePermittedByUpdate = (permittedBy: PermittedBy) => {
    onChange(permittedBy, []); // TODO GROUPS?
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
          checked={permittedBy === 'admins_moderators'}
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
      {showGroupSelect(permittedBy) && (
        <Box mt="20px">
          <Title variant="h4" color="primary">
            <FormattedMessage {...messages.restrictParticipation} />
          </Title>
          <GroupSelect
            groupIds={groupIds}
            disabled={permittedBy !== 'custom'}
            onChange={(groups) => {
              onChange(permissionData.attributes.permitted_by, groups);
            }}
          />
        </Box>
      )}
      <Box mt="28px">
        <Fields phaseId={phaseId} action={action} />
      </Box>
    </form>
  );
};

export default ActionFormNew;
