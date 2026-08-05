import { IconNames } from '@citizenlab/cl2-component-library';

import { ContactChannel } from './types';

export const CHANNEL_EXPIRY_FIELDS = {
  email: 'confirmed_email_expiry',
  phone: 'confirmed_phone_number_expiry',
} as const;

export const CHANNEL_ICONS = {
  email: 'email',
  phone: 'tablet',
} as const satisfies Record<ContactChannel, IconNames>;
