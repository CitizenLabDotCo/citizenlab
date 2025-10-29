import { defineMessages } from 'react-intl';

export default defineMessages({
  emailAlreadyTaken: {
    id: 'app.containers.Authentication.steps.InvitationResent.emailAlreadyTaken2',
    defaultMessage:
      "{email} is already taken by a pending invite. Please check your email and click on the link to accept the invitation. If you can't find the invitation email, click the button below to resend it. The email might take a few minutes to arrive.",
  },
  resendInvite: {
    id: 'app.containers.Authentication.steps.InvitationResent.resendInvite2',
    defaultMessage: 'Resend invitation',
  },
  invitationResent: {
    id: 'app.containers.Authentication.steps.InvitationResent.invitationResent2',
    defaultMessage: 'Invitation resent!',
  },
});
