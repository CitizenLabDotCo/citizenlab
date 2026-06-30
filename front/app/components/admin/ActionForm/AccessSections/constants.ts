import { MessageDescriptor } from 'utils/cl-intl';

import { AuthMethodKey } from '../types';

import messages from './messages';

export const AUTH_METHOD_LABELS: Record<AuthMethodKey, MessageDescriptor> = {
  email: messages.confirmedEmail,
  verification: messages.identityVerification,
};
