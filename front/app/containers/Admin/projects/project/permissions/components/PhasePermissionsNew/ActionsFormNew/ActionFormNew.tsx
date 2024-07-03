import React from 'react';

import { Box, CardButton } from '@citizenlab/cl2-component-library';

import { IPermissionData } from 'api/permissions/types';

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

  const handlePermittedByUpdate =
    (permittedBy: IPermissionData['attributes']['permitted_by']) => (e) => {
      e.preventDefault();

      onChange(permittedBy, []); // TODO
    };

  const {
    // id: permissionId,
    attributes: { permitted_by: permittedBy, action },
  } = permissionData;

  const isSurveyAction =
    phaseType === 'nativeSurvey' && action === 'posting_idea';

  return (
    <form>
      <Box display="flex" gap="16px">
        {isSurveyAction && (
          <CardButton
            id="e2e-permission-everyone"
            iconName="email"
            title={formatMessage(actionFormMessages.permissionsUsersLabel)}
            subtitle={formatMessage(
              actionFormMessages.permissionsUsersLabelDescription
            )}
            onClick={handlePermittedByUpdate('everyone')}
            selected={permittedBy === 'everyone'}
          />
        )}
        <CardButton
          id="e2e-permission-registered-users"
          iconName="email"
          title={formatMessage(actionFormMessages.permissionsUsersLabel)}
          subtitle={formatMessage(
            actionFormMessages.permissionsUsersLabelDescription
          )}
          onClick={handlePermittedByUpdate('users')}
          selected={permittedBy === 'users'}
        />
        <CardButton
          id="e2e-permission-admins-managers"
          iconName="shield-checkered"
          title={formatMessage(messages.adminsManagers)}
          subtitle={formatMessage(messages.adminsManagersSubtitle)}
          onClick={handlePermittedByUpdate('admins_moderators')}
          selected={permittedBy === 'admins_moderators'}
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
