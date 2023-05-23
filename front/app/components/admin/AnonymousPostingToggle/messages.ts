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
    id: 'app.components.AnonymousPostingToggle.userAnonymityLabelSubtext2',
    defaultMessage:
      'Users will be able to hide their identity from other users, project moderators and admins. These contributions can still be moderated.',
  },
  userAnonymityLabelTooltip: {
    id: 'app.components.AnonymousPostingToggle.userAnonymityLabelTooltip',
    defaultMessage:
      'Users may still choose to participate with their real name, but they will have the option to submit contributions anonymously if they choose to do so. All users will still need to comply with the requirements set in the Access Rights tab for their contributions to go through.',
  },
});
