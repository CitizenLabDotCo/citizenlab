import { defineMessages } from 'react-intl';

export default defineMessages({
  xVolunteers: {
    id: 'app.containers.ProjectsShowPage.VolunteeringSection.xVolunteers',
    defaultMessage:
      '{x, plural, =0 {no volunteers} one {# volunteer} other {# volunteers}}',
  },
  becomeVolunteerButton: {
    id:
      'app.containers.ProjectsShowPage.VolunteeringSection.becomeVolunteerButton',
    defaultMessage: 'I want to volunteer',
  },
  withdrawVolunteerButton: {
    id:
      'app.containers.ProjectsShowPage.VolunteeringSection.withdrawVolunteerButton',
    defaultMessage: 'I withdraw my offer to volunteer',
  },
  notLoggedIn: {
    id: 'app.containers.ProjectsShowPage.VolunteeringSection.notLoggedIn',
    defaultMessage:
      'Please {signInLink} or {signUpLink} first in order to volunteer for this activity',
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
