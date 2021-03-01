import { defineMessages } from 'react-intl';

export default defineMessages({
  rulesExplanation: {
    id: 'app.containers.AdminPage.Users.GroupCreation.rulesExplanation',
    defaultMessage:
      'Users matching all of the following conditions will be automatically added to the group:',
  },
  verificationDisabled: {
    id: 'app.containers.AdminPage.Users.UsersGroup.verificationDisabled',
    defaultMessage:
      'Verification is disabled for your platform, remove the verification rule or contact support.',
  },
  rulesError: {
    id: 'app.containers.AdminPage.Users.UsersGroup.rulesError',
    defaultMessage: 'Some conditions are incomplete',
  },
});
