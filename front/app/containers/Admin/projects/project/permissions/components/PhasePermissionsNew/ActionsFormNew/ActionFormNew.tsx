import React from 'react';
import { Box, CardButton } from '@citizenlab/cl2-component-library';
import { useIntl } from 'utils/cl-intl';
import messages from './messages';
import actionFormMessages from 'components/admin/ActionsForm/messages';
import permissionsMessages from 'containers/Admin/projects/project/permissions/messages';

type Props = any;

const ActionFormNew = (_: Props) => {
  const { formatMessage } = useIntl();

  const permittedBy = 'users' as any; // TODO

  const handlePermittedByUpdate = (_permittedBy: any) => (e) => {
    e.preventDefault();
  }; // TODO

  return (
    <form>
      <Box display="flex" gap="16px">
        {/* TODO hide anyone if not survey */}
        <CardButton
          id="e2e-permission-anyone"
          iconName="user-circle"
          title={formatMessage(permissionsMessages.permissionsAnyoneLabel)}
          subtitle={formatMessage(
            permissionsMessages.permissionsAnyoneLabelDescription
          )}
          onClick={handlePermittedByUpdate('anyone')} // TODO
          selected={permittedBy === 'anyone'} // TODO
        />
        <CardButton
          id="e2e-permission-registered-users"
          iconName="email"
          title={formatMessage(actionFormMessages.permissionsUsersLabel)}
          subtitle={formatMessage(
            actionFormMessages.permissionsUsersLabelDescription
          )}
          onClick={handlePermittedByUpdate('users')} // TODO
          selected={permittedBy === 'users'} // TODO
        />
        <CardButton
          id="e2e-permission-custom"
          iconName="cog"
          title={formatMessage(messages.custom)}
          subtitle={formatMessage(messages.customSubtitle)}
          onClick={handlePermittedByUpdate('custom')} // TODO
          selected={permittedBy === 'custom'} // TODO
        />
      </Box>
    </form>
  );
};

export default ActionFormNew;
