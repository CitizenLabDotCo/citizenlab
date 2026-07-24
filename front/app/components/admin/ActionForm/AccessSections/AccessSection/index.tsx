// "Who can participate": authentication methods + groups.

import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import useVerificationMethod from 'api/id_methods/useVerificationMethod';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { useIntl } from 'utils/cl-intl';

import {
  getMethod,
  hasEnabledMethod,
  methodChange,
  requiresAccount,
} from '../../logic';
import { AuthMethodKey } from '../../types';
import { SectionHeader, Hint } from '../../ui';
import GroupsSection from '../GroupsSection';
import IdMethodsModalTrigger from '../IdMethodsModal/Trigger';
import ModeCards from '../ModeCards';
import { AccessSectionProps } from '../shared';

import messages from './messages';
import MethodRow from './MethodRow';

const METHOD_KEYS: AuthMethodKey[] = ['email', 'verification'];

const unavailableReason = (key: AuthMethodKey) => {
  if (key === 'email') {
    return messages.unavailablePasswordLogin;
  }
  return messages.unavailableVerification;
};

const AccessSection = ({
  permission,
  showAnyone,
  onChange,
}: AccessSectionProps) => {
  const { formatMessage } = useIntl();
  const hasAccount = requiresAccount(permission);

  // Which authentication methods the platform offers comes from live config:
  // confirmed email needs password login; identity verification needs a
  // configured verification method.
  const passwordLoginEnabled = useFeatureFlag({ name: 'password_login' });
  const { data: verificationMethod } = useVerificationMethod();
  const verificationMetadata =
    verificationMethod?.data.attributes.method_metadata;

  const isAvailable: Record<AuthMethodKey, boolean> = {
    email: passwordLoginEnabled,
    verification: !!verificationMetadata,
  };

  const enabledMethodCount = METHOD_KEYS.filter(
    (key) => getMethod(permission, key).enabled
  ).length;

  return (
    <Box>
      <SectionHeader
        icon="user-circle"
        title={formatMessage(messages.whoCanParticipate)}
        tooltip={formatMessage(messages.firstDecide)}
      />

      <ModeCards
        permittedBy={permission.attributes.permitted_by}
        showAnyone={showAnyone}
        signInTitle={formatMessage(messages.requireSignIn)}
        signInDescription={formatMessage(messages.mustProveIdentity)}
        onChange={onChange}
      />

      {hasAccount && (
        <>
          {/* Authentication methods (the primary decision — always shown) */}
          <Box>
            {METHOD_KEYS.map((key) => {
              const { enabled, expiry } = getMethod(permission, key);
              // Don't let the last enabled method be turned off: a permission
              // must always keep at least one (mirrors the backend validation).
              const locked = enabled && enabledMethodCount === 1;
              return (
                <MethodRow
                  key={key}
                  methodKey={key}
                  enabled={enabled}
                  expiry={expiry}
                  available={isAvailable[key]}
                  unavailableReason={formatMessage(unavailableReason(key))}
                  locked={locked}
                  onChange={(next) => onChange(methodChange(key, next))}
                />
              );
            })}

            {!hasEnabledMethod(permission) && (
              <Box mt="8px">
                <Hint>{formatMessage(messages.pickAtLeastOne)}</Hint>
              </Box>
            )}

            {/* Belongs to the methods above as a group, not to any one of
                them — identification covers authentication and verification
                alike. */}
            <IdMethodsModalTrigger />
          </Box>

          <GroupsSection permission={permission} onChange={onChange} />
        </>
      )}
    </Box>
  );
};

export default AccessSection;
