import React from 'react';

import {
  Box,
  colors,
  Title,
  CardButton,
  Tooltip,
} from '@citizenlab/cl2-component-library';

import { IPermissionData } from 'api/permissions/types';

import useFeatureFlag from 'hooks/useFeatureFlag';

import permissionsMessages from 'containers/Admin/projects/project/permissions/messages';

import Warning from 'components/UI/Warning';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import AdminCollaboratorToggle from './AdminCollaboratorToggle';
import GroupSelect from './GroupSelect';
import messages from './messages';

interface Props {
  permissionData: IPermissionData;
  groupIds?: string[];
  projectType?: 'defaultInput' | 'initiative' | 'nativeSurvey';
  onChange: (
    permittedBy:
      | IPermissionData['attributes']['permitted_by']
      | IPermissionData['attributes']['global_custom_fields'],
    groupIds: Props['groupIds']
  ) => void;
}

const ActionForm = ({
  permissionData,
  groupIds,
  projectType,
  onChange,
}: Props) => {
  const { formatMessage } = useIntl();
  const userConfirmationEnabled = useFeatureFlag({ name: 'user_confirmation' });

  const handlePermittedByUpdate =
    (value: IPermissionData['attributes']['permitted_by']) => (e) => {
      e.preventDefault();
      onChange(value, groupIds);
    };

  const handleGroupIdsUpdate = (groups: string[]) => {
    onChange(permissionData.attributes.permitted_by, groups);
  };

  const {
    id: permissionId,
    attributes: { permitted_by: permittedBy, action },
  } = permissionData;

  return (
    <form>
      <Box mb="10px">
        <AdminCollaboratorToggle
          enabled={permittedBy === 'admins_moderators'}
          id={`participation-permission-admins-${permissionId}`}
          onChange={handlePermittedByUpdate(
            permittedBy === 'admins_moderators' ? 'users' : 'admins_moderators'
          )}
        />
      </Box>
      {permittedBy !== 'admins_moderators' && (
        <Box mt="20px">
          <Box display="flex" gap="16px" mb="20px">
            {/* TODO: Take a decision on which action we should use for native surveys versus ideation. One or separate?
            If separate, we will need to update code where we check for attributes.posting_idea */}
            {(action === 'taking_survey' || projectType === 'nativeSurvey') && (
              <CardButton
                iconName="user-circle"
                title={formatMessage(
                  permissionsMessages.permissionsAnyoneLabel
                )}
                subtitle={formatMessage(
                  permissionsMessages.permissionsAnyoneLabelDescription
                )}
                onClick={handlePermittedByUpdate('everyone')}
                selected={permittedBy === 'everyone'}
              />
            )}
            <Tooltip
              // user_confirmation needs to be enabled for this option to work
              disabled={userConfirmationEnabled}
              content={
                <FormattedMessage
                  {...messages.userConfirmationRequiredTooltip}
                />
              }
            >
              <CardButton
                id="e2e-permission-email-confirmed-users"
                iconName="email"
                title={formatMessage(messages.permissionsEmailConfirmLabel)}
                subtitle={formatMessage(
                  messages.permissionsEmailConfirmLabelDescription
                )}
                onClick={handlePermittedByUpdate('everyone_confirmed_email')}
                selected={permittedBy === 'everyone_confirmed_email'}
                disabled={!userConfirmationEnabled}
                height="100%"
              />
            </Tooltip>
            <CardButton
              id="e2e-permission-registered-users"
              iconName="user-check"
              title={formatMessage(messages.permissionsUsersLabel)}
              subtitle={formatMessage(
                messages.permissionsUsersLabelDescription
              )}
              onClick={handlePermittedByUpdate('users')}
              selected={permittedBy === 'users'}
            />
            <CardButton
              id="e2e-permission-user-groups"
              iconName="group"
              title={formatMessage(
                permissionsMessages.permissionsSelectionLabel
              )}
              subtitle={formatMessage(
                permissionsMessages.permissionsSelectionLabelDescription
              )}
              onClick={handlePermittedByUpdate('groups')}
              selected={permittedBy === 'groups'}
            />
          </Box>
          {permittedBy === 'groups' && (
            <Box
              mt="10px"
              borderLeft={`solid 1px ${colors.grey300}`}
              px="20px"
              pt="10px"
              pb="20px"
            >
              <Title
                variant="h4"
                color="primary"
                style={{ fontWeight: 600 }}
                mt="5px"
              >
                <FormattedMessage {...messages.selectUserGroups} />
              </Title>
              <GroupSelect
                groupIds={groupIds}
                onChange={handleGroupIdsUpdate}
              />
            </Box>
          )}
          {permittedBy === 'everyone_confirmed_email' && (
            <Box mt="16px" maxWidth="740px" mb="20px">
              <Warning>
                {formatMessage(messages.permissionEveryoneEmailWarning)}
              </Warning>
            </Box>
          )}
        </Box>
      )}
    </form>
  );
};

export default ActionForm;
