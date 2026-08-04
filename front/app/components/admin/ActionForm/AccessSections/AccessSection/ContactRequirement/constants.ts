// The five ways an admin can ask participants to prove they are reachable.
//
// These are the values of the permission's `email_and_phone_requirements`. The
// first four are what two independent toggles could express; the fifth -
// "either one" - is the case they could not, and the reason this control exists
// instead of two separate toggles.

import { IconNames } from '@citizenlab/cl2-component-library';

import { EmailAndPhoneRequirements } from 'api/phase_permissions/types';

import { MessageDescriptor } from 'utils/cl-intl';

import { ContactChannel } from '../../../types';

import messages from './messages';

export interface ContactOption {
  key: EmailAndPhoneRequirements;
  // Icons shown in the option's badge, joined by `connector`.
  icons: IconNames[];
  connector?: 'plus' | 'or';
  title: MessageDescriptor;
  // One-liner shown on the collapsed trigger.
  summary: MessageDescriptor;
  // Fuller explanation shown on the card inside the modal.
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
    icons: ['email'],
    title: messages.emailTitle,
    summary: messages.emailSummary,
    description: messages.emailDescription,
    requires: ['email'],
  },
  {
    key: 'phone_only',
    icons: ['tablet'],
    title: messages.phoneTitle,
    summary: messages.phoneSummary,
    description: messages.phoneDescription,
    requires: ['phone'],
  },
  {
    key: 'both_email_and_phone',
    icons: ['email', 'tablet'],
    connector: 'plus',
    title: messages.bothTitle,
    summary: messages.bothSummary,
    description: messages.bothDescription,
    requires: ['email', 'phone'],
  },
  {
    key: 'either_email_or_phone',
    icons: ['email', 'tablet'],
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
  // "Nothing confirmed" leaves the account with no proof behind it at all, so
  // it is only on offer when identity verification takes that role. Mirrors the
  // backend's authentication_method_required validation.
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
