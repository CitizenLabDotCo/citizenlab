import React from 'react';

import { Box, Title } from '@citizenlab/cl2-component-library';

import { IPhasePermissionData } from 'api/permissions/types';
import { PermittedBy } from 'api/phase_permissions/types';

import AdminCollaboratorToggle from 'components/admin/ActionsForm/AdminCollaboratorToggle';
import GroupSelect from 'components/admin/ActionsForm/GroupSelect';

import { FormattedMessage } from 'utils/cl-intl';

import CardButtons from './CardButtons';
import Fields from './Fields';
import FlowVisualization from './FlowVisualization';
import { isSupportedPermittedBy } from './FlowVisualization/utils';
import messages from './messages';
import Tooltip from './Tooltip';

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
    onChange(permittedBy, groupIds);
  };

  const {
    id: permissionId,
    attributes: { permitted_by: permittedBy, action },
  } = permissionData;

  const isSurveyAction =
    phaseType === 'nativeSurvey' && action === 'posting_idea';

  const disableEditing = permittedBy !== 'custom';

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
      {isSupportedPermittedBy(permittedBy) && (
        <Box mt="20px">
          <FlowVisualization permittedBy={permittedBy} />
        </Box>
      )}
      <Box mt="20px">
        <Fields
          phaseId={phaseId}
          action={action}
          disableEditing={disableEditing}
        />
      </Box>
      {showGroupSelect(permittedBy) && (
        <Box mt="28px">
          <Title variant="h4" color="primary">
            <FormattedMessage {...messages.restrictParticipation} />
          </Title>
          {/* For some reason this tooltip doesn't work properly unless I put it in
           * a Box of exactly the same size as the child component
           */}
          <Box w="300px">
            <Tooltip disabled={!disableEditing}>
              <GroupSelect
                groupIds={groupIds}
                disabled={disableEditing}
                onChange={(groups) => {
                  onChange(permissionData.attributes.permitted_by, groups);
                }}
              />
            </Tooltip>
          </Box>
        </Box>
      )}
    </form>
  );
};

export default ActionFormNew;
