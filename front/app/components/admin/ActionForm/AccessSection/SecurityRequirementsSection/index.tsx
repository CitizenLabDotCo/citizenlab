// Extra proof required *on top of* signing in. Deliberately separate from the
// sign-in methods above: a platform can let people in by email, SMS or SSO
// without demanding any of these, and each of these can be demanded whichever
// way the participant signed in.

import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';

import { IPhasePermissionData } from 'api/phase_permissions/types';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { useIntl } from 'utils/cl-intl';

import { useVisibleToggles } from '../../logic';
import actionFormMessages from '../../messages';
import { Changes } from '../../types';
import { Expander } from '../../ui';

import messages from './messages';
import MethodRow from './MethodRow';

interface Props {
  permission: IPhasePermissionData;
  onChange: (changes: Changes) => void;
}

const SecurityRequirementsSection = ({ permission, onChange }: Props) => {
  const { formatMessage } = useIntl();
  const { attributes } = permission;

  const smsLoginEnabled = useFeatureFlag({ name: 'sms_login' });
  const visibleToggles = useVisibleToggles();

  if (!visibleToggles) return null;

  const {
    email: showEmail,
    phone: showPhone,
    verification: showVerification,
  } = visibleToggles;

  // Only what is both offered here and actually switched on belongs in the
  // collapsed summary, in its short form — the full sentences below are too
  // long to line up on one row.
  const activeLabels: string[] = [];
  if (showEmail && attributes.require_confirmed_email) {
    activeLabels.push(formatMessage(actionFormMessages.confirmedEmail));
  }
  if (showPhone && attributes.require_confirmed_phone_number) {
    activeLabels.push(formatMessage(actionFormMessages.confirmedPhone));
  }
  if (showVerification && attributes.require_verification) {
    activeLabels.push(formatMessage(actionFormMessages.verification));
  }

  if (!showEmail && !showPhone && !showVerification) {
    return null;
  }

  return (
    <Box borderBottom={`1px solid ${colors.divider}`}>
      <Expander
        icon="shield-checkered"
        title={formatMessage(messages.securityChecks)}
        summary={
          activeLabels.length
            ? activeLabels.join(' · ')
            : formatMessage(messages.none)
        }
        defaultOpen={activeLabels.length > 0}
      >
        {showEmail && (
          <MethodRow
            icon="email"
            label={formatMessage(actionFormMessages.requireConfirmedEmail)}
            description={formatMessage(messages.emailMethodDescription)}
            enabled={attributes.require_confirmed_email}
            expiry={attributes.confirmed_email_expiry}
            verb="Re-confirm"
            onChange={({ enabled, expiry }) =>
              onChange({
                require_confirmed_email: enabled,
                confirmed_email_expiry: expiry,
              })
            }
          />
        )}

        {showPhone && (
          <MethodRow
            icon="tablet"
            label={formatMessage(
              actionFormMessages.requireConfirmedPhoneNumber
            )}
            // Without SMS login nobody signs up by phone, so the check is
            // simply "everyone or nobody" — the conditional wording would only
            // confuse.
            description={formatMessage(
              smsLoginEnabled
                ? messages.phoneMethodDescriptionWithSmsLogin
                : messages.phoneMethodDescription
            )}
            enabled={attributes.require_confirmed_phone_number}
            expiry={attributes.confirmed_phone_number_expiry}
            verb="Re-confirm"
            onChange={({ enabled, expiry }) =>
              onChange({
                require_confirmed_phone_number: enabled,
                confirmed_phone_number_expiry: expiry,
              })
            }
          />
        )}

        {showVerification && (
          <MethodRow
            icon="shield-checkered"
            label={formatMessage(
              actionFormMessages.requireIdentityVerification
            )}
            description={formatMessage(messages.verificationMethodDescription)}
            enabled={attributes.require_verification}
            expiry={attributes.verification_expiry}
            verb="Re-verify"
            onChange={({ enabled, expiry }) =>
              onChange({
                require_verification: enabled,
                verification_expiry: expiry,
              })
            }
          />
        )}
      </Expander>
    </Box>
  );
};

export default SecurityRequirementsSection;
