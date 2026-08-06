import { defineMessages } from 'react-intl';

const scope =
  'front.app.components.admin.ActionForm.AccessSections.AccessSection.ContactRequirement';

export default defineMessages({
  // ---- Trigger ----
  contactDetails: {
    id: `${scope}.contactDetails`,
    defaultMessage: 'Email and phone requirements',
  },
  contactDetailsTooltip: {
    id: `${scope}.contactDetailsTooltip2`,
    defaultMessage:
      'Which contact details a participant has to confirm before they can take part. Confirming means entering a code we send them, which proves the email address or phone number is really theirs.',
  },
  change: {
    id: `${scope}.change`,
    defaultMessage: 'Change',
  },

  // ---- Modal ----
  whatMustParticipantsConfirm: {
    id: `${scope}.whatMustParticipantsConfirm`,
    defaultMessage: 'What must participants confirm?',
  },
  modalIntro: {
    id: `${scope}.modalIntro`,
    defaultMessage:
      'Participants receive a code and enter it to prove the address or number belongs to them. Asking for more makes duplicate accounts harder, but also asks more of every participant.',
  },
  done: {
    id: `${scope}.done`,
    defaultMessage: 'Done',
  },
  or: {
    id: `${scope}.or`,
    defaultMessage: 'or',
  },

  // ---- The five options ----
  noneTitle: {
    id: `${scope}.noneTitle`,
    defaultMessage: 'Nothing confirmed',
  },
  noneSummary: {
    id: `${scope}.noneSummary`,
    defaultMessage: 'No contact details are confirmed',
  },
  noneDescription: {
    id: `${scope}.noneDescription`,
    defaultMessage:
      'An account is enough. Quickest to join, but the same person can sign up again with a new address.',
  },

  emailTitle: {
    id: `${scope}.emailTitle`,
    defaultMessage: 'Email address',
  },
  emailSummary: {
    id: `${scope}.emailSummary`,
    defaultMessage: 'Confirmed by email',
  },
  emailDescription: {
    id: `${scope}.emailDescription`,
    defaultMessage:
      'Participants confirm an email address with a code. The most common choice.',
  },

  bothTitle: {
    id: `${scope}.bothTitle`,
    defaultMessage: 'Email and phone number',
  },
  bothSummary: {
    id: `${scope}.bothSummary`,
    defaultMessage: 'Both confirmed',
  },
  bothDescription: {
    id: `${scope}.bothDescription`,
    defaultMessage:
      'Both are confirmed, one after the other. The strongest check, but two extra steps for everyone.',
  },

  eitherTitle: {
    id: `${scope}.eitherTitle`,
    defaultMessage: 'Email or phone number',
  },
  eitherSummary: {
    id: `${scope}.eitherSummary`,
    defaultMessage: 'One of the two, participant chooses',
  },
  eitherDescription: {
    id: `${scope}.eitherDescription`,
    defaultMessage:
      'Participants pick whichever they have and confirm that one. Reaches the widest audience without dropping the check.',
  },

  // ---- Availability ----
  unavailableReason: {
    id: `${scope}.unavailableReason`,
    defaultMessage: 'Unavailable - {reason}',
  },
  needsPasswordLogin: {
    id: `${scope}.needsPasswordLogin`,
    defaultMessage: 'Password login is turned off for this platform.',
  },
  needsSms: {
    id: `${scope}.needsSms`,
    defaultMessage: 'SMS is turned off for this platform.',
  },
  needsBoth: {
    id: `${scope}.needsBoth`,
    defaultMessage:
      'Both password login and SMS need to be turned on for this platform.',
  },
  needsVerification: {
    id: `${scope}.needsVerification`,
    defaultMessage:
      'Participants must confirm something, unless identity verification is required instead.',
  },

  // ---- Recency, per channel ----
  emailRecency: {
    id: `${scope}.emailRecency`,
    defaultMessage: 'Email address',
  },
  phoneRecency: {
    id: `${scope}.phoneRecency`,
    defaultMessage: 'Phone number',
  },
});
