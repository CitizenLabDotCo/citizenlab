import { defineMessages } from 'react-intl';

export default defineMessages({
  userPrivacy: {
    id: 'app.components.AnonymousPostingToggle.userPrivacy',
    defaultMessage: 'User privacy',
  },
  userPrivacyLabelText: {
    id: 'app.components.AnonymousPostingToggle.userPrivacyLabelText2',
    defaultMessage: 'Allow users to participate anonymously',
  },
  userPrivacyLabelSubtext: {
    id: 'app.components.AnonymousPostingToggle.userPrivacyLabelSubtext2',
    defaultMessage:
      'Users will be able to hide their identity from other users and admins. Admins can still ban/moderate their inputs.',
  },
  userPrivacyLabelTooltip: {
    id: 'app.components.AnonymousPostingToggle.userPrivacyLabelTooltip2',
    defaultMessage:
      'Users may still choose to participate with their real name, but they will have the option to submit contributions anonymously if they choose to do so. All users will still need to comply with the requirements set in the Access Rights tab for their contributions to go through.',
  },
});
