import React from 'react';

import useFeatureFlag from 'hooks/useFeatureFlag';

import ActionForm from './ActionForm';
import ActionFormNoPWLogin from './ActionFormNoPWLogin';
import { Props } from './types';

/**
 * Picks the right "Participation requirements" panel for the platform:
 *  - with password login enabled, the standard panel lets admins pick between
 *    confirmed email / identity verification;
 *  - without it, there is no email/password account, so we fall back to the
 *    single fixed SSO sign-in variant.
 */
const ActionFormIndex = (props: Props) => {
  const passwordLoginEnabled = useFeatureFlag({ name: 'password_login' });

  return passwordLoginEnabled ? (
    <ActionForm {...props} />
  ) : (
    <ActionFormNoPWLogin {...props} />
  );
};

export default ActionFormIndex;
