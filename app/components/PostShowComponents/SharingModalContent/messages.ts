import { defineMessages } from 'react-intl';

export default defineMessages({
  twitterMessage: {
    id: 'app.components.PostComponents.SharingModalContent.twitterMessage',
    defaultMessage: 'Vote for {postTitle} on',
  },
  ideaEmailSharingSubject: {
    id:
      'app.components.PostComponents.SharingModalContent.ideaEmailSharingSubject',
    defaultMessage: 'Support my idea: {postTitle}.',
  },
  initiativeEmailSharingSubject: {
    id:
      'app.components.PostComponents.SharingModalContent.initiativeEmailSharingSubject',
    defaultMessage: 'Support my initiative: {postTitle}.',
  },
  emailSharingBody: {
    id: 'app.components.PostComponents.SharingModalContent.emailSharingBody',
    defaultMessage: 'Support my idea {ideaTitle} at {ideaUrl}!',
  },
  initiativeEmailSharingBody: {
    id:
      'app.components.PostComponents.SharingModalContent.initiativeEmailSharingBody',
    defaultMessage:
      'What do you think of this initiative? Vote on it and share the discussion at {postUrl} to make your voice heard!',
  },
  ideaWhatsAppMessage: {
    id: 'app.components.PostComponents.SharingModalContent.ideaWhatsAppMessage',
    defaultMessage: 'Support my idea: {ideaTitle}.',
  },
  whatsAppMessageProposal: {
    id:
      'app.components.PostComponents.SharingModalContent.whatsAppMessageProposal',
    defaultMessage: 'I just posted a proposal for {orgName}: {postTitle}',
  },
});
