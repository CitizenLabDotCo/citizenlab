// "Who can participate": authentication methods + groups.

import React, { useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import useVerificationMethod from 'api/id_methods/useVerificationMethod';

import useFeatureFlag from 'hooks/useFeatureFlag';

import {
  getMethod,
  hasEnabledMethod,
  methodChange,
  requiresAccount,
} from '../logic';
import { AuthMethodKey } from '../types';
import { SectionHeader, Hint } from '../ui';


import GroupsSection from './GroupsSection';
import MethodRow from './MethodRow';
import ModeCards from './ModeCards';
import { AccessSectionProps } from './shared';
import VerificationFieldsModal from './VerificationFieldsModal';

const METHOD_KEYS: AuthMethodKey[] = ['email', 'verification'];

const unavailableReason = (key: AuthMethodKey): string => {
  if (key === 'email') {
    return 'Unavailable: password login is turned off for this platform.';
  }
  return 'Unavailable: no identity verification method is configured.';
};

const AccessSection = ({
  permission,
  showAnyone,
  onChange,
}: AccessSectionProps) => {
  const hasAccount = requiresAccount(permission);
  const [returnedFieldsOpen, setReturnedFieldsOpen] = useState(false);

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
        title="Who can participate"
        tooltip="First decide whether an account is needed at all, then pick the proof of identity required."
      />

      <ModeCards
        permittedBy={permission.attributes.permitted_by}
        showAnyone={showAnyone}
        signInTitle="Require sign-in"
        signInDescription="Must prove who they are first."
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
                  unavailableReason={unavailableReason(key)}
                  locked={locked}
                  onChange={(next) => onChange(methodChange(key, next))}
                  onShowReturnedFields={() => setReturnedFieldsOpen(true)}
                />
              );
            })}

            {!hasEnabledMethod(permission) && (
              <Box mt="8px">
                <Hint>
                  Pick at least one method, otherwise participants have no way to
                  prove who they are.
                </Hint>
              </Box>
            )}
          </Box>

          <GroupsSection permission={permission} onChange={onChange} />
        </>
      )}

      <VerificationFieldsModal
        opened={returnedFieldsOpen}
        onClose={() => setReturnedFieldsOpen(false)}
      />
    </Box>
  );
};

export default AccessSection;
