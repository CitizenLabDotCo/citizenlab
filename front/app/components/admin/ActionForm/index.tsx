import React from 'react';

import {
  Box,
  Button,
  Title,
  fontSizes,
} from '@citizenlab/cl2-component-library';

import { IPermissionData } from 'api/permissions/types';
import usePermissionsCustomFields from 'api/permissions_custom_fields/usePermissionsCustomFields';
import { PermittedBy } from 'api/phase_permissions/types';
import usePhase from 'api/phases/usePhase';

import { FormattedMessage } from 'utils/cl-intl';

import AdminCollaboratorToggle from './AdminCollaboratorToggle';
import CardButtons from './CardButtons';
import Fields from './Fields';
import FlowVisualization from './FlowVisualization';
import GroupSelect from './GroupSelect';
import messages from './messages';
import { showResetButton } from './utils';

type Changes = {
  permittedBy?: PermittedBy;
  groupIds?: string[];
  verificationExpiry?: number | null;
};

interface Props {
  phaseId?: string;
  groupIds?: string[];
  permissionData: IPermissionData;
  onChange: (changes: Changes) => void;
  onReset: () => void;
}

const ActionForm = ({
  phaseId,
  permissionData,
  groupIds,
  onChange,
  onReset,
}: Props) => {
  const {
    id: permissionId,
    attributes: { permitted_by, action, verification_enabled },
  } = permissionData;

  const { data: phase } = usePhase(phaseId);

  const { data: permissionsCustomFields } = usePermissionsCustomFields({
    phaseId,
    action,
  });

  const handlePermittedByUpdate = (permittedBy: PermittedBy) => {
    onChange({ permittedBy });
  };

  const participation_method = phase?.data.attributes.participation_method;

  const isSurveyAction =
    participation_method === 'native_survey' && action === 'posting_idea';

  if (!permissionsCustomFields) return null;

  return (
    <form>
      <AdminCollaboratorToggle
        checked={permitted_by === 'admins_moderators'}
        id={`participation-permission-admins-${permissionId}`}
        onChange={() => {
          handlePermittedByUpdate(
            permitted_by === 'admins_moderators' ? 'users' : 'admins_moderators'
          );
        }}
      />
      {permitted_by !== 'admins_moderators' && (
        <>
          <Box my="20px">
            <Title variant="h4" m="0" color="primary">
              <FormattedMessage {...messages.authentication} />
            </Title>
          </Box>
          <Box display="flex" gap="16px">
            <CardButtons
              showAnyone={isSurveyAction}
              permittedBy={permitted_by}
              onUpdate={handlePermittedByUpdate}
            />
          </Box>
          <Box mt="20px">
            <FlowVisualization
              permittedBy={permitted_by}
              verificationEnabled={verification_enabled}
              permissionsCustomFields={permissionsCustomFields.data}
            />
          </Box>
          <Box mt="20px">
            <Fields
              phaseId={phaseId}
              action={action}
              showAddQuestion={permitted_by !== 'everyone'}
            />
          </Box>
          {permitted_by !== 'everyone' && (
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
                  onChange={(groupIds) => {
                    onChange({ groupIds });
                  }}
                />
              </Box>
            </Box>
          )}
          {showResetButton(
            permitted_by,
            permissionsCustomFields.data,
            groupIds
          ) && (
            <Box mt="28px" w="100%" display="flex">
              <Button
                width="auto"
                buttonStyle="text"
                onClick={onReset}
                padding="0px"
                fontSize={`${fontSizes.m}px`}
              >
                <span style={{ textDecorationLine: 'underline' }}>
                  <FormattedMessage
                    {...messages.resetExtraQuestionsAndGroups}
                  />
                </span>
              </Button>
            </Box>
          )}
        </>
      )}
    </form>
  );
};

export default ActionForm;
