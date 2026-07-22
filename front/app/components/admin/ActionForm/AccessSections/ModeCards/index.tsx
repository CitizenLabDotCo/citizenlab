import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { PermittedBy } from 'api/phase_permissions/types';

import { useIntl } from 'utils/cl-intl';

import { Changes } from '../../types';
import { Hint, ModeCard } from '../../ui';

import messages from './messages';

interface Props {
  permittedBy: PermittedBy;
  // Whether the "Anyone" option is offered.
  showAnyone: boolean;
  signInTitle: string;
  signInDescription: string;
  onChange: (changes: Changes) => void;
}

const ModeCards = ({
  permittedBy,
  showAnyone,
  signInTitle,
  signInDescription,
  onChange,
}: Props) => {
  const { formatMessage } = useIntl();
  const setMode = (permitted_by: PermittedBy) => onChange({ permitted_by });

  return (
    <>
      <Box display="flex" flexWrap="wrap" gap="8px" mb="16px">
        {showAnyone && (
          <ModeCard
            icon="user-circle"
            title={formatMessage(messages.anyone)}
            description={formatMessage(messages.noAccountNeeded)}
            selected={permittedBy === 'everyone'}
            className="e2e-permission-anyone"
            onClick={() => setMode('everyone')}
          />
        )}
        <ModeCard
          icon="shield-checkered"
          title={signInTitle}
          description={signInDescription}
          selected={permittedBy === 'users'}
          className="e2e-permission-registered-users"
          onClick={() => setMode('users')}
        />
        <ModeCard
          icon="lock"
          title={formatMessage(messages.adminManagersOnly)}
          description={formatMessage(messages.restrictedToStaff)}
          selected={permittedBy === 'admins_moderators'}
          className="e2e-permission-admins-managers"
          onClick={() => setMode('admins_moderators')}
        />
      </Box>

      {permittedBy === 'admins_moderators' && (
        <Hint>{formatMessage(messages.onlyAdminsAndManagers)}</Hint>
      )}
    </>
  );
};

export default ModeCards;
