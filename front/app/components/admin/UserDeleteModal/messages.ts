import { defineMessages } from 'react-intl';

export default defineMessages({
  deleteUserHeader: {
    id: 'app.containers.Admin.Users.deleteUserModal.header',
    defaultMessage: 'Delete user account',
  },
  deleteUserIntro: {
    id: 'app.containers.Admin.Users.deleteUserModal.intro',
    defaultMessage: 'You are about to permanently delete',
  },
  memberSince: {
    id: 'app.containers.Admin.Users.deleteUserModal.memberSince',
    defaultMessage: 'Member since {date}',
  },
  participationSummary: {
    id: 'app.containers.Admin.Users.deleteUserModal.participationSummary',
    defaultMessage: 'Participation summary',
  },
  ideasCount: {
    id: 'app.containers.Admin.Users.deleteUserModal.ideasCount',
    defaultMessage: '{count, plural, one {# idea} other {# ideas}}',
  },
  proposalsCount: {
    id: 'app.containers.Admin.Users.deleteUserModal.proposalsCount',
    defaultMessage: '{count, plural, one {# proposal} other {# proposals}}',
  },
  surveyResponsesCount: {
    id: 'app.containers.Admin.Users.deleteUserModal.surveyResponsesCount',
    defaultMessage:
      '{count, plural, one {# survey response} other {# survey responses}}',
  },
  commentsCount: {
    id: 'app.containers.Admin.Users.deleteUserModal.commentsCount',
    defaultMessage: '{count, plural, one {# comment} other {# comments}}',
  },
  reactionsCount: {
    id: 'app.containers.Admin.Users.deleteUserModal.reactionsCount',
    defaultMessage: '{count, plural, one {# reaction} other {# reactions}}',
  },
  votesCount: {
    id: 'app.containers.Admin.Users.deleteUserModal.votesCount',
    defaultMessage: '{count, plural, one {# vote} other {# votes}}',
  },
  pollResponsesCount: {
    id: 'app.containers.Admin.Users.deleteUserModal.pollResponsesCount',
    defaultMessage:
      '{count, plural, one {# poll response} other {# poll responses}}',
  },
  volunteersCount: {
    id: 'app.containers.Admin.Users.deleteUserModal.volunteersCount',
    defaultMessage:
      '{count, plural, one {# volunteer signup} other {# volunteer signups}}',
  },
  eventAttendancesCount: {
    id: 'app.containers.Admin.Users.deleteUserModal.eventAttendancesCount',
    defaultMessage:
      '{count, plural, one {# event registration} other {# event registrations}}',
  },
  noParticipation: {
    id: 'app.containers.Admin.Users.deleteUserModal.noParticipation',
    defaultMessage: 'This user has no participation data.',
  },
  deleteParticipationData: {
    id: 'app.containers.Admin.Users.deleteUserModal.deleteParticipationData',
    defaultMessage: 'Delete participation data',
  },
  banEmail: {
    id: 'app.containers.Admin.Users.deleteUserModal.banEmail',
    defaultMessage: 'Ban email',
  },
  banEmailTooltip: {
    id: 'app.containers.Admin.Users.deleteUserModal.banEmailTooltip',
    defaultMessage:
      'Prevents future registration with this email address and common variants (e.g., dots in Gmail addresses)',
  },
  banReasonPlaceholder: {
    id: 'app.containers.Admin.Users.deleteUserModal.banReasonPlaceholder',
    defaultMessage: 'Reason (optional)',
  },
  emailAlreadyBanned: {
    id: 'app.containers.Admin.Users.deleteUserModal.emailAlreadyBanned',
    defaultMessage: 'This email address (or a variant) is already banned.',
  },
  banReasonLabel: {
    id: 'app.containers.Admin.Users.deleteUserModal.banReasonLabel',
    defaultMessage: 'Reason',
  },
  cannotBeUndone: {
    id: 'app.containers.Admin.Users.deleteUserModal.cannotBeUndone',
    defaultMessage: 'This action cannot be undone.',
  },
  cancel: {
    id: 'app.containers.Admin.Users.deleteUserModal.cancel',
    defaultMessage: 'Cancel',
  },
  deleteAccount: {
    id: 'app.containers.Admin.Users.deleteUserModal.deleteAccount',
    defaultMessage: 'Delete account',
  },
});
