import React from 'react';

import { CardButton } from '@citizenlab/cl2-component-library';

import { PermittedBy } from 'api/phase_permissions/types';

import useFeatureFlag from 'hooks/useFeatureFlag';

import permissionsMessages from 'containers/Admin/projects/project/permissions/messages';

import actionFormMessages from 'components/admin/ActionsForm/messages';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  isSurveyAction: boolean;
  permittedBy: PermittedBy;
  onUpdate: (permittedBy: PermittedBy) => void;
}

const CardButtons = ({ isSurveyAction, permittedBy, onUpdate }: Props) => {
  const { formatMessage } = useIntl();
  const userConfirmationEnabled = useFeatureFlag({ name: 'user_confirmation' });

  const handleUpdate = (permittedBy: PermittedBy) => (e) => {
    e.preventDefault();
    onUpdate(permittedBy);
  };

  return (
    <>
      {isSurveyAction && (
        <CardButton
          id="e2e-permission-anyone"
          iconName="user-circle"
          title={formatMessage(permissionsMessages.permissionsAnyoneLabel)}
          subtitle={formatMessage(
            permissionsMessages.permissionsAnyoneLabelDescription
          )}
          onClick={handleUpdate('everyone')}
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
        onClick={handleUpdate('everyone_confirmed_email')}
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
        onClick={handleUpdate('users')}
        selected={permittedBy === 'users'}
      />
      <CardButton
        id="e2e-permission-custom"
        iconName="cog"
        title={formatMessage(messages.custom)}
        subtitle={formatMessage(messages.customSubtitle)}
        onClick={handleUpdate('custom')}
        selected={permittedBy === 'custom'}
      />
    </>
  );
};

export default CardButtons;
