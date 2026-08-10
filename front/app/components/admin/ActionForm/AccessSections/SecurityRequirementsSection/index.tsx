// Extra proof required *on top of* signing in. Deliberately separate from the
// sign-in methods above: a platform can let people in by email, SMS or SSO
// without demanding any of these, and each of these can be demanded whichever
// way the participant signed in.

import React from 'react';

import useVerificationMethod from 'api/id_methods/useVerificationMethod';
import { IPhasePermissionData } from 'api/phase_permissions/types';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { useIntl } from 'utils/cl-intl';

import { getMethod, methodChange } from '../../logic';
import { AuthMethodKey, Changes } from '../../types';
import { Expander } from '../../ui';
import { AUTH_METHOD_LABELS } from '../constants';

import messages from './messages';
import MethodRow from './MethodRow';

const METHOD_KEYS: AuthMethodKey[] = ['email', 'phone', 'verification'];

interface Props {
  permission: IPhasePermissionData;
  onChange: (changes: Changes) => void;
}

const SecurityRequirementsSection = ({ permission, onChange }: Props) => {
  const { formatMessage } = useIntl();

  // Confirming a phone number means sending an SMS, so it needs the feature;
  // `sms_login` is irrelevant here, since this is not a way of signing in.
  const smsEnabled = useFeatureFlag({ name: 'sms' });
  const { data: verificationMethod } = useVerificationMethod();
  const verificationConfigured =
    !!verificationMethod?.data.attributes.method_metadata;

  // Confirming an email is possible whatever the participant signed in with, so
  // it no longer depends on password login being available.
  const unavailableReason = (key: AuthMethodKey) =>
    key === 'verification' && !verificationConfigured
      ? formatMessage(messages.unavailableVerification)
      : undefined;

  // Phone is hidden entirely when SMS is off rather than shown as unavailable —
  // there is nothing an admin could do about it from here.
  const visibleKeys = METHOD_KEYS.filter(
    (key) => key !== 'phone' || smsEnabled
  );
  const activeKeys = visibleKeys.filter(
    (key) => getMethod(permission, key).enabled && !unavailableReason(key)
  );

  return (
    <Expander
      icon="shield-checkered"
      title={formatMessage(messages.securityChecks)}
      summary={
        activeKeys.length
          ? activeKeys
              .map((key) => formatMessage(AUTH_METHOD_LABELS[key]))
              .join(' · ')
          : formatMessage(messages.none)
      }
      defaultOpen={activeKeys.length > 0}
    >
      {visibleKeys.map((key) => {
        const { enabled, expiry } = getMethod(permission, key);
        return (
          <MethodRow
            key={key}
            methodKey={key}
            enabled={enabled}
            expiry={expiry}
            unavailableReason={unavailableReason(key)}
            onChange={(next) => onChange(methodChange(key, next))}
          />
        );
      })}
    </Expander>
  );
};

export default SecurityRequirementsSection;
