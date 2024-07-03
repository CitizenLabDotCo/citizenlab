import React from 'react';

import { Box, CardButton } from '@citizenlab/cl2-component-library';

import { IPermissionData } from 'api/permissions/types';

import useFeatureFlag from 'hooks/useFeatureFlag';

import permissionsMessages from 'containers/Admin/projects/project/permissions/messages';

import AdminCollaboratorToggle from 'components/admin/ActionsForm/AdminCollaboratorToggle';
import actionFormMessages from 'components/admin/ActionsForm/messages';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

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

const ActionFormNew = ({ permissionData, phaseType, onChange }: Props) => {
  const { formatMessage } = useIntl();
  const userConfirmationEnabled = useFeatureFlag({ name: 'user_confirmation' });

  const handlePermittedByUpdate =
    (permittedBy: IPermissionData['attributes']['permitted_by']) => (e) => {
      e.preventDefault();

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
          onChange={handlePermittedByUpdate(
            permittedBy === 'admins_moderators' ? 'users' : 'admins_moderators'
          )}
        />
      </Box>
      <Box display="flex" gap="16px">
        {isSurveyAction && (
          <CardButton
            id="e2e-permission-anyone"
            iconName="user-circle"
            title={formatMessage(permissionsMessages.permissionsAnyoneLabel)}
            subtitle={formatMessage(
              permissionsMessages.permissionsAnyoneLabelDescription
            )}
            onClick={handlePermittedByUpdate('everyone')}
            selected={permittedBy === 'everyone'}
          />
        )}
        <CardButton
          id="e2e-permission-email-confirmed-users"
          iconName="email"
          title={formatMessage(actionFormMessages.permissionsEmailConfirmLabel)}
          subtitle={formatMessage(
            actionFormMessages.permissionsEmailConfirmLabelDescription
          )}
          onClick={handlePermittedByUpdate('everyone_confirmed_email')}
          selected={permittedBy === 'everyone_confirmed_email'}
          disabled={!userConfirmationEnabled}
          height="100%"
        />
        <CardButton
          id="e2e-permission-registered-users"
          iconName="user-check"
          title={formatMessage(actionFormMessages.permissionsUsersLabel)}
          subtitle={formatMessage(
            actionFormMessages.permissionsUsersLabelDescription
          )}
          onClick={handlePermittedByUpdate('users')}
          selected={permittedBy === 'users'}
        />
        <CardButton
          id="e2e-permission-custom"
          iconName="cog"
          title={formatMessage(messages.custom)}
          subtitle={formatMessage(messages.customSubtitle)}
          onClick={handlePermittedByUpdate('custom')}
          selected={permittedBy === 'custom'}
        />
      </Box>
    </form>
  );
};

export default ActionFormNew;
