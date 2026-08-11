// Everything that differs per security check — what it is called, how it is
// described, which icon stands for it, and which permission attributes back it.
// One entry per method, so adding a check is a single edit here rather than a
// hunt through parallel lookup tables.

import { IconNames } from '@citizenlab/cl2-component-library';

import { IPhasePermissionData } from 'api/phase_permissions/types';

import { MessageDescriptor } from 'utils/cl-intl';

import messages from './messages';
import { SecurityRequirementKey } from './types';

type PermissionAttributes = IPhasePermissionData['attributes'];

// The key order is the order the methods appear in, both as toggles and as
// summary chips.
export const SECURITY_REQUIREMENTS = {
  email: {
    label: messages.confirmedEmail,
    description: messages.emailMethodDescription,
    icon: 'email',
    // `expiry` is in days, `null` = "once, ever".
    enabledField: 'require_confirmed_email',
    expiryField: 'confirmed_email_expiry',
  },
  phone: {
    label: messages.confirmedPhoneNumber,
    description: messages.phoneMethodDescription,
    icon: 'tablet',
    enabledField: 'require_confirmed_phone_number',
    expiryField: 'confirmed_phone_number_expiry',
  },
  verification: {
    label: messages.identityVerification,
    description: messages.verificationMethodDescription,
    icon: 'shield-checkered',
    enabledField: 'require_verification',
    expiryField: 'verification_expiry',
  },
} as const satisfies Record<
  SecurityRequirementKey,
  {
    label: MessageDescriptor;
    description: MessageDescriptor;
    icon: IconNames;
    enabledField: keyof PermissionAttributes;
    expiryField: keyof PermissionAttributes;
  }
>;
