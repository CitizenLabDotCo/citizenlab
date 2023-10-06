import { defineMessages } from 'react-intl';

export default defineMessages({
  xVolunteers: {
    id: 'app.containers.ProjectsShowPage.VolunteeringSection.xVolunteers',
    defaultMessage:
      '{x, plural, =0 {no volunteers} one {# volunteer} other {# volunteers}}',
  },
  becomeVolunteerButton: {
    id: 'app.containers.ProjectsShowPage.VolunteeringSection.becomeVolunteerButton',
    defaultMessage: 'I want to volunteer',
  },
  withdrawVolunteerButton: {
    id: 'app.containers.ProjectsShowPage.VolunteeringSection.withdrawVolunteerButton',
    defaultMessage: 'I withdraw my offer to volunteer',
  },
  disabledMaybeNotPermitted: {
    id: 'app.containers.ProjectsShowPage.VolunteeringSection.disabledMaybeNotPermitted',
    defaultMessage:
      'To know if you can volunteer, please {signInLink} or {signUpLink} to the platform first.',
  },
  disabledInactive: {
    id: 'app.containers.ProjectsShowPage.VolunteeringSection.disabledInactive',
    defaultMessage: 'Volunteering is only possible when this phase is active.',
  },
  disabledNotActiveUser: {
    id: 'app.containers.ProjectsShowPage.VolunteeringSection.disabledNotActiveUser',
    defaultMessage: 'Please {completeRegistrationLink} to volunteer.',
  },
  disabledNotPermitted: {
    id: 'app.containers.ProjectsShowPage.VolunteeringSection.disabledNotPermitted',
    defaultMessage: "You don't have permission to volunteer.",
  },
  disabledNotVerified: {
    id: 'app.containers.ProjectsShowPage.VolunteeringSection.disabledNotVerified',
    defaultMessage:
      'Volunteering requires verification of your identity. {verificationLink}',
  },
  signInLinkText: {
    id: 'app.containers.ProjectsShowPage.VolunteeringSection.signInLinkText',
    defaultMessage: 'log in',
  },
  signUpLinkText: {
    id: 'app.containers.ProjectsShowPage.VolunteeringSection.signUpLinkText',
    defaultMessage: 'sign up',
  },
});
