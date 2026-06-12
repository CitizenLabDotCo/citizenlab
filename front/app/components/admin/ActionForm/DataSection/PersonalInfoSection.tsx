// "Personal info": the name and (optionally) password we ask for. Only
// meaningful when participation requires an account.

import React from 'react';

import { piiSummary } from '../logic';
import { Changes, IPhasePermissionData } from '../types';
import { Expander } from '../ui';

import PiiToggle from './PiiToggle';

interface Props {
  permission: IPhasePermissionData;
  passwordAvailable: boolean;
  // The password requirement is specific to email/password accounts; SSO-only
  // variants hide it entirely.
  showPassword?: boolean;
  onChange: (changes: Changes) => void;
}

const PersonalInfoSection = ({
  permission,
  passwordAvailable,
  showPassword = true,
  onChange,
}: Props) => {
  const { attributes } = permission;

  return (
    <Expander
      icon="user-circle"
      title="Personal info"
      summary={piiSummary(permission)}
    >
      <PiiToggle
        icon="user-circle"
        title="Full name"
        description="Ask for first and last name."
        checked={attributes.require_name}
        onChange={() => onChange({ require_name: !attributes.require_name })}
      />
      {showPassword && (
        <PiiToggle
          icon="lock"
          title="Password"
          description={
            passwordAvailable
              ? 'Require a password on the account.'
              : 'Requires the “Confirmed email” method to be enabled.'
          }
          checked={attributes.require_password}
          disabled={!passwordAvailable}
          onChange={() =>
            onChange({ require_password: !attributes.require_password })
          }
        />
      )}
    </Expander>
  );
};

export default PersonalInfoSection;
