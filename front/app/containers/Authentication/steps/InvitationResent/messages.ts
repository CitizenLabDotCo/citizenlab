import { defineMessages } from 'react-intl';

export default defineMessages({
  emailAlreadyTaken: {
    id: 'app.containers.Authentication.steps.InvitationResent.emailAlreadyTaken',
    defaultMessage:
      '{email} is already taken by a pending invite. We have re-sent the invitation mail. Please enter the token in the email below.',
  },
});
