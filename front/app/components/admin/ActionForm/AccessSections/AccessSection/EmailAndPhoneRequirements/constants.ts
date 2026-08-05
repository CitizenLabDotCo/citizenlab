import { IconNames } from '@citizenlab/cl2-component-library';

import { EmailAndPhoneRequirements } from 'api/phase_permissions/types';

import { MessageDescriptor } from 'utils/cl-intl';

import { CHANNEL_ICONS } from '../../../constants';
import { ContactChannel } from '../../../types';

import messages from './messages';

export interface ContactOption {
  key: EmailAndPhoneRequirements;
  icons: IconNames[];
  connector?: 'plus' | 'or';
  title: MessageDescriptor;
  // Shown on the collapsed trigger.
  summary: MessageDescriptor;
  // Shown on the card inside the modal.
  description: MessageDescriptor;
  requires: ContactChannel[];
}

export const CONTACT_OPTIONS: ContactOption[] = [
  {
    key: 'neither',
    icons: ['minus-circle'],
    title: messages.noneTitle,
    summary: messages.noneSummary,
    description: messages.noneDescription,
    requires: [],
  },
  {
    key: 'email_only',
    icons: [CHANNEL_ICONS.email],
    title: messages.emailTitle,
    summary: messages.emailSummary,
    description: messages.emailDescription,
    requires: ['email'],
  },
  {
    key: 'both_email_and_phone',
    icons: [CHANNEL_ICONS.email, CHANNEL_ICONS.phone],
    connector: 'plus',
    title: messages.bothTitle,
    summary: messages.bothSummary,
    description: messages.bothDescription,
    requires: ['email', 'phone'],
  },
  {
    key: 'either_email_or_phone',
    icons: [CHANNEL_ICONS.email, CHANNEL_ICONS.phone],
    connector: 'or',
    title: messages.eitherTitle,
    summary: messages.eitherSummary,
    description: messages.eitherDescription,
    requires: ['email', 'phone'],
  },
];

export const getOption = (key: EmailAndPhoneRequirements): ContactOption =>
  CONTACT_OPTIONS.find((o) => o.key === key) ?? CONTACT_OPTIONS[0];

/** Why an option can't be picked, or `null` when it can. */
export const unavailableReason = (
  option: ContactOption,
  available: Record<ContactChannel, boolean>,
  // Mirrors the backend's authentication_method_required validation.
  verificationRequired: boolean
): MessageDescriptor | null => {
  if (option.key === 'neither') {
    return verificationRequired ? null : messages.needsVerification;
  }

  const missing = option.requires.filter((channel) => !available[channel]);
  if (missing.length === 0) return null;
  if (missing.length === 2) return messages.needsBoth;
  return missing[0] === 'email'
    ? messages.needsPasswordLogin
    : messages.needsSms;
};
