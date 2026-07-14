import { IconNames } from '@citizenlab/cl2-component-library';

import { MessageDescriptor } from 'utils/cl-intl';

import { AuthMethodKey } from '../types';

import messages from './messages';

export const AUTH_METHOD_LABELS: Record<AuthMethodKey, MessageDescriptor> = {
  email: messages.confirmedEmail,
  phone: messages.confirmedPhoneNumber,
  verification: messages.identityVerification,
};

export const METHOD_META: Record<
  AuthMethodKey,
  { icon: IconNames; description: MessageDescriptor }
> = {
  email: {
    icon: 'email',
    description: messages.emailMethodDescription,
  },
  phone: {
    icon: 'message',
    description: messages.phoneMethodDescription,
  },
  verification: {
    icon: 'shield-checkered',
    description: messages.verificationMethodDescription,
  },
};
