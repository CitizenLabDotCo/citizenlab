import { defineMessages } from 'react-intl';

export default defineMessages({
  userAnonymity: {
    id: 'app.components.AnonymousPostingToggle.userAnonymity',
    defaultMessage: 'User anonymity',
  },
  userAnonymityLabelText: {
    id: 'app.components.AnonymousPostingToggle.userAnonymityLabelText',
    defaultMessage: 'Allow users to participate anonymously',
  },
  userAnonymityLabelSubtext: {
    id: 'app.components.AnonymousPostingToggle.userAnonymityLabelSubtext',
    defaultMessage:
      'Users will be able to hide their identity from other users, project managers and admins. These contributions can still be moderated.',
  },
  userAnonymityLabelTooltip: {
    id: 'app.components.AnonymousPostingToggle.userAnonymityLabelTooltip2',
    defaultMessage:
      'Users may still choose to participate with their real name, but they will have the option to submit contributions anonymously if they choose to do so. All users will still need to comply with the requirements set in the Access Rights tab for their contributions to go through. User profile data will not be available on the participation data export.',
  },
  userAnonymitySupportTooltip: {
    id: 'app.components.AnonymousPostingToggle.userAnonymitySupportTooltip',
    defaultMessage: 'Learn more about user anonymity in our {supportArticle}.',
  },
  userAnonymitySupportTooltipLinkText: {
    id: 'app.components.AnonymousPostingToggle.userAnonymitySupportTooltipLinkText',
    defaultMessage: 'support article',
  },
  userAnonymitySupportTooltipLinkUrl2: {
    id: 'app.components.AnonymousPostingToggle.userAnonymitySupportTooltipLinkUrl2',
    defaultMessage:
      'https://support.govocal.com/en/articles/527583-enabling-anonymous-participation',
  },
  anonymousParticipationAutoEnabled: {
    id: 'app.components.AnonymousPostingToggle.anonymousParticipationAutoEnabled',
    defaultMessage:
      'Anonymous posting for logged-in users is automatically enabled when the posting requirement is set to "None" (no registration needed).',
  },
});
