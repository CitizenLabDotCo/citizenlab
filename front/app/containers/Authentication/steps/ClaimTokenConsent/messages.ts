import { defineMessages } from 'react-intl';

export default defineMessages({
  linkYourContributions: {
    id: 'app.containers.Authentication.steps.ClaimTokenConsent.linkYourContributions',
    defaultMessage: 'Link your contributions to stay updated',
  },
  youRecentlyParticipatedWhileLoggedOut: {
    id: 'app.containers.Authentication.steps.ClaimTokenConsent.youRecentlyParticipatedWhileLoggedOut',
    defaultMessage:
      'You recently participated in one or more projects while logged out. Do you want to link these participations to your account? This will help you stay updated on the projects you participated in and receive relevant notifications.',
  },
  linkParticipations: {
    id: 'app.containers.Authentication.steps.ClaimTokenConsent.linkParticipations',
    defaultMessage: 'Link participations',
  },
  keepAnonymous: {
    id: 'app.containers.Authentication.steps.ClaimTokenConsent.keepAnonymous',
    defaultMessage: 'Keep participations anonymous',
  },
});
