// Extra proof required *on top of* signing in. Deliberately separate from the
// sign-in methods above: a platform can let people in by email, SMS or SSO
// without demanding any of these, and each of these can be demanded whichever
// way the participant signed in.

import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';

import useAuthenticationMethod from 'api/id_methods/useAuthenticationMethod';
import useVerificationMethod from 'api/id_methods/useVerificationMethod';
import { IPhasePermissionData } from 'api/phase_permissions/types';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { useIntl } from 'utils/cl-intl';

import { getMethod, methodChange } from '../../logic';
import { Changes } from '../../types';
import { Expander } from '../../ui';
import { AUTH_METHOD_LABELS } from '../constants';

import messages from './messages';
import MethodRow from './MethodRow';
import { getVisibleToggles } from './utils';

interface Props {
  permission: IPhasePermissionData;
  onChange: (changes: Changes) => void;
}

const SecurityRequirementsSection = ({ permission, onChange }: Props) => {
  const { formatMessage } = useIntl();

  const smsEnabled = useFeatureFlag({ name: 'sms' });
  const smsLoginEnabled = useFeatureFlag({ name: 'sms_login' });
  const { data: verificationMethod } = useVerificationMethod();
  const { data: authenticationMethod } = useAuthenticationMethod();

  const visibleKeys = getVisibleToggles({
    sms2FAEnabled: smsEnabled,
    smsLoginEnabled,
    verificationMethodEnabled: !!verificationMethod,
    authenticationMethodEnabled: !!authenticationMethod,
  });

  const activeKeys = visibleKeys.filter(
    (key) => getMethod(permission, key).enabled
  );

  if (visibleKeys.length === 0) {
    return null;
  }

  return (
    <Box borderBottom={`1px solid ${colors.divider}`}>
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
              onChange={(next) => onChange(methodChange(key, next))}
            />
          );
        })}
      </Expander>
    </Box>
  );
};

export default SecurityRequirementsSection;
