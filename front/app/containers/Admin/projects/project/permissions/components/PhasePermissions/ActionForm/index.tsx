import React from 'react';

import { Box, Button, Title, colors } from '@citizenlab/cl2-component-library';

import { PermittedBy, IPhasePermissionData } from 'api/phase_permissions/types';
import useResetPhasePermission from 'api/phase_permissions/useResetPhasePermission';

import { FormattedMessage } from 'utils/cl-intl';

import AdminCollaboratorToggle from './AdminCollaboratorToggle';
import CardButtons from './CardButtons';
import Fields from './Fields';
import FlowVisualization from './FlowVisualization';
import { isSupportedPermittedBy } from './FlowVisualization/utils';
import GroupSelect from './GroupSelect';
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

const ActionForm = ({
  phaseId,
  permissionData,
  groupIds,
  phaseType,
  onChange,
}: Props) => {
  const handlePermittedByUpdate = (permittedBy: PermittedBy) => {
    onChange(permittedBy, groupIds);
  };

  const { mutate: resetPermission } = useResetPhasePermission();

  const {
    id: permissionId,
    attributes: { permitted_by: permittedBy, action },
  } = permissionData;

  const isSurveyAction =
    phaseType === 'nativeSurvey' && action === 'posting_idea';

  return (
    <form>
      <Box
        mb="20px"
        display="flex"
        flexDirection="row"
        w="100%"
        maxWidth="996px"
        justifyContent="space-between"
      >
        <Title variant="h4" m="0" color="primary">
          <FormattedMessage {...messages.authentication} />
        </Title>
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
          <FlowVisualization
            permittedBy={permittedBy}
            phaseId={phaseId}
            action={action}
          />
        </Box>
      )}
      <Box mt="20px" w="100%" display="flex">
        <Button
          width="auto"
          bgColor={colors.primary}
          onClick={() => {
            resetPermission({
              permissionId,
              phaseId,
              action,
            });
          }}
        >
          <FormattedMessage {...messages.resetExtraQuestionsAndGroups} />
        </Button>
      </Box>
      <Box mt="20px">
        <Fields phaseId={phaseId} action={action} />
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
            <GroupSelect
              groupIds={groupIds}
              onChange={(groups) => {
                onChange(permissionData.attributes.permitted_by, groups);
              }}
            />
          </Box>
        </Box>
      )}
    </form>
  );
};

export default ActionForm;
