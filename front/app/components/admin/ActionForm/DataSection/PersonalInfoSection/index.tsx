// "Personal info": the name and (optionally) password we ask for. Only
// meaningful when participation requires an account.

import React from 'react';

import useAuthenticationMethod from 'api/id_methods/useAuthenticationMethod';
import { IPhasePermissionData } from 'api/phase_permissions/types';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { useIntl } from 'utils/cl-intl';

import actionFormMessages from '../../messages';
import { Changes } from '../../types';
import { Expander } from '../../ui';

import messages from './messages';
import PiiToggle from './PiiToggle';

interface Props {
  permission: IPhasePermissionData;
  onChange: (changes: Changes) => void;
}

const PersonalInfoSection = ({ permission, onChange }: Props) => {
  const { attributes } = permission;
  const { formatMessage } = useIntl();
  // The password requirement is specific to email/password accounts; SSO-only
  // platforms (password login disabled) hide it entirely.
  const showPassword = useFeatureFlag({ name: 'password_login' });
  // Whether at least one SSO authentication method is enabled. When there is
  // none the endpoint returns 204 (→ null), so a truthy value means SSO sign-up
  // is possible - in which case the password requirement only applies to users
  // who sign up by email, which we explain via a tooltip. (This query is shared
  // and cached, so calling it here does not trigger an extra fetch.)
  const { data: authenticationMethod } = useAuthenticationMethod();
  const hasSSOAuthMethod = !!authenticationMethod;

  // One-line summary shown while the row is collapsed. Password is never asked
  // when password login is off, so it must not appear here either - it would
  // advertise a field that can't be collected.
  const summaryParts: string[] = [];
  if (attributes.require_name) {
    summaryParts.push(formatMessage(actionFormMessages.name));
  }
  if (showPassword && attributes.require_password) {
    summaryParts.push(formatMessage(actionFormMessages.password));
  }

  return (
    <Expander
      icon="user-circle"
      title={formatMessage(messages.personalInfo)}
      summary={
        summaryParts.length
          ? summaryParts.join(' · ')
          : formatMessage(messages.nothingExtra)
      }
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
          description={formatMessage(messages.passwordAvailableDescription)}
          tooltip={
            hasSSOAuthMethod
              ? formatMessage(messages.passwordOnlyForEmailSignupTooltip)
              : undefined
          }
          checked={attributes.require_password}
          onChange={() =>
            onChange({ require_password: !attributes.require_password })
          }
        />
      )}
    </Expander>
  );
};

export default PersonalInfoSection;
