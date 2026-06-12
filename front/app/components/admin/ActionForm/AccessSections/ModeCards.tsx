// The top-level access choice — Anyone / Require sign-in / Admins & managers —
// plus the admins-only hint. Shared by both access-section variants; only the
// sign-in card's wording differs between them.

import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { PermittedBy } from 'api/phase_permissions/types';

import { Changes } from '../types';
import { Hint, ModeCard } from '../ui';

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
  const setMode = (permitted_by: PermittedBy) => onChange({ permitted_by });

  return (
    <>
      <Box display="flex" flexWrap="wrap" gap="8px" mb="16px">
        {showAnyone && (
          <ModeCard
            icon="user-circle"
            title="Anyone"
            description="No account needed."
            selected={permittedBy === 'everyone'}
            onClick={() => setMode('everyone')}
          />
        )}
        <ModeCard
          icon="shield-checkered"
          title={signInTitle}
          description={signInDescription}
          selected={permittedBy === 'users'}
          onClick={() => setMode('users')}
        />
        <ModeCard
          icon="lock"
          title="Admins & managers only"
          description="Restricted to staff."
          selected={permittedBy === 'admins_moderators'}
          onClick={() => setMode('admins_moderators')}
        />
      </Box>

      {permittedBy === 'admins_moderators' && (
        <Hint>
          Only admins and managers can take this action. No other requirements
          apply.
        </Hint>
      )}
    </>
  );
};

export default ModeCards;
