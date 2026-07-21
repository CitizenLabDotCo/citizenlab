// "Who can participate": authentication methods + groups.

import React, { useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import useVerificationMethod from 'api/id_methods/useVerificationMethod';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { useIntl } from 'utils/cl-intl';

import { getMethod, methodChange, requiresAccount } from '../../logic';
import { AuthMethodKey } from '../../types';
import { SectionHeader } from '../../ui';
import GroupsSection from '../GroupsSection';
import ModeCards from '../ModeCards';
import { AccessSectionProps } from '../shared';
import VerificationFieldsModal from '../VerificationFieldsModal';

import messages from './messages';
import MethodRow from './MethodRow';

const METHOD_KEYS: AuthMethodKey[] = ['email', 'phone', 'verification'];

// Phone is hidden entirely when SMS is off (see below), so it never renders in
// an unavailable state — only email and verification do.
const unavailableReason = (key: AuthMethodKey) =>
  key === 'email'
    ? messages.unavailablePasswordLogin
    : messages.unavailableVerification;

const AccessSection = ({
  permission,
  showAnyone,
  onChange,
}: AccessSectionProps) => {
  const { formatMessage } = useIntl();
  const hasAccount = requiresAccount(permission);
  const [returnedFieldsOpen, setReturnedFieldsOpen] = useState(false);

  // Which authentication methods the platform offers comes from live config:
  // confirmed email needs password login; a confirmed phone number needs the
  // SMS feature; identity verification needs a configured verification method.
  const passwordLoginEnabled = useFeatureFlag({ name: 'password_login' });
  const smsEnabled = useFeatureFlag({ name: 'sms' });
  const { data: verificationMethod } = useVerificationMethod();
  const verificationMetadata =
    verificationMethod?.data.attributes.method_metadata;

  const isAvailable: Record<AuthMethodKey, boolean> = {
    email: passwordLoginEnabled,
    phone: smsEnabled,
    verification: !!verificationMetadata,
  };

  // The phone method is hidden entirely when SMS is off, rather than shown as
  // unavailable (email and verification keep their "unavailable" state).
  const visibleMethodKeys = METHOD_KEYS.filter(
    (key) => key !== 'phone' || smsEnabled
  );

  const enabledMethodCount = visibleMethodKeys.filter(
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
            {visibleMethodKeys.map((key) => {
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
                  onShowReturnedFields={() => setReturnedFieldsOpen(true)}
                />
              );
            })}
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
