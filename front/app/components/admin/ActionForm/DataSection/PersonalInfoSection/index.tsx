// "Personal info": the name and (optionally) password we ask for. Only
// meaningful when participation requires an account.

import React from 'react';

import { IPhasePermissionData } from 'api/phase_permissions/types';

import { useIntl } from 'utils/cl-intl';

import { piiSummary } from '../../logic';
import { Changes } from '../../types';
import { Expander } from '../../ui';
import PiiToggle from '../PiiToggle';

import messages from './messages';

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
  const { formatMessage } = useIntl();

  return (
    <Expander
      icon="user-circle"
      title={formatMessage(messages.personalInfo)}
      summary={piiSummary(permission, formatMessage)}
    >
      <PiiToggle
        icon="user-circle"
        title={formatMessage(messages.fullName)}
        description={formatMessage(messages.fullNameDescription)}
        checked={attributes.require_name}
        onChange={() => onChange({ require_name: !attributes.require_name })}
      />
      {showPassword && (
        <PiiToggle
          icon="lock"
          title={formatMessage(messages.password)}
          description={
            passwordAvailable
              ? formatMessage(messages.passwordAvailableDescription)
              : formatMessage(messages.passwordUnavailableDescription)
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
