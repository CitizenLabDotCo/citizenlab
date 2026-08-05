// "Who can participate": authentication methods + groups.

import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import useVerificationMethod from 'api/id_methods/useVerificationMethod';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { useIntl } from 'utils/cl-intl';

import {
  channelExpiryChange,
  getChannelExpiry,
  getContactRequirement,
  getVerification,
  requiresAccount,
  verificationChange,
} from '../../logic';
import { SectionHeader } from '../../ui';
import GroupsSection from '../GroupsSection';
import IdMethodsModalTrigger from '../IdMethodsModal/Trigger';
import ModeCards from '../ModeCards';
import { AccessSectionProps } from '../shared';

import EmailAndPhoneRequirementsControl from './EmailAndPhoneRequirements';
import messages from './messages';
import VerificationToggle from './VerificationToggle';

const AccessSection = ({
  permission,
  showAnyone,
  onChange,
}: AccessSectionProps) => {
  const { formatMessage } = useIntl();
  const hasAccount = requiresAccount(permission);

  // Which authentication methods the platform offers comes from live config:
  // confirmed email needs password login; a confirmed phone number needs the
  // SMS feature; identity verification needs a configured verification method.
  const passwordLoginEnabled = useFeatureFlag({ name: 'password_login' });
  const smsEnabled = useFeatureFlag({ name: 'sms' });
  const { data: verificationMethod } = useVerificationMethod();
  const verificationAvailable =
    !!verificationMethod?.data.attributes.method_metadata;

  const contactRequirement = getContactRequirement(permission);
  const verification = getVerification(permission);

  // A permission must keep at least one form of proof: if nothing is confirmed,
  // verification can't be switched off either. (The mirror of this rule — not
  // being able to pick "nothing confirmed" without verification — lives in the
  // contact requirement modal.)
  const verificationLocked =
    verification.enabled && contactRequirement === 'neither';

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
          {/* Authentication methods (the primary decision — always shown).
              Email and phone are one choice; verification is a different kind
              of proof, so it stays a toggle of its own. */}
          <Box>
            <EmailAndPhoneRequirementsControl
              value={contactRequirement}
              available={{ email: passwordLoginEnabled, phone: smsEnabled }}
              verificationRequired={verification.enabled}
              expiries={{
                email: getChannelExpiry(permission, 'email'),
                phone: getChannelExpiry(permission, 'phone'),
              }}
              onChange={(email_and_phone_requirements) =>
                onChange({ email_and_phone_requirements })
              }
              onChangeExpiry={(channel, expiry) =>
                onChange(channelExpiryChange(channel, expiry))
              }
            />

            <VerificationToggle
              enabled={verification.enabled}
              expiry={verification.expiry}
              available={verificationAvailable}
              locked={verificationLocked}
              onChange={(next) => onChange(verificationChange(next))}
            />
          </Box>
          <IdMethodsModalTrigger />
          <GroupsSection permission={permission} onChange={onChange} />
        </>
      )}
    </Box>
  );
};

export default AccessSection;
