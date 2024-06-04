import { defineMessages } from 'react-intl';

export default defineMessages({
  surveyDisabledProjectInactive: {
    id: 'app.containers.ProjectsShowPage.process.survey.surveyDisabledProjectInactive2',
    defaultMessage:
      'The survey is no longer available, since this project is no longer active.',
  },
  surveyDisabledNotPermitted: {
    id: 'app.containers.ProjectsShowPage.process.survey.surveyDisabledNotPermitted',
    defaultMessage:
      "Unfortunately, you don't have the rights to take this survey.",
  },
  surveyDisabledMaybeNotPermitted: {
    id: 'app.containers.ProjectsShowPage.process.survey.surveyDisabledMaybeNotPermitted',
    defaultMessage:
      'Only certain users can take this survey. Please {signUpLink} or {logInLink} first.',
  },
  surveyDisabledMaybeNotVerified: {
    id: 'app.containers.ProjectsShowPage.process.survey.surveyDisabledMaybeNotVerified',
    defaultMessage:
      'Only verified users can take this survey. Please {signUpLink} or {logInLink} first.',
  },
  surveyDisabledNotActiveUser: {
    id: 'app.containers.ProjectsShowPage.process.survey.surveyDisabledNotActiveUser',
    defaultMessage: 'Please {completeRegistrationLink} to take the survey.',
  },
  surveyDisabledNotActivePhase: {
    id: 'app.containers.ProjectsShowPage.process.survey.surveyDisabledNotActivePhase',
    defaultMessage:
      'This survey can only be taken when this phase in the timeline is active.',
  },
  verificationLinkText: {
    id: 'app.containers.ProjectsShowPage.process.survey.verificationLinkText',
    defaultMessage: 'Verify your account now.',
  },
  completeRegistrationLinkText: {
    id: 'app.containers.ProjectsShowPage.process.survey.completeRegistrationLinkText',
    defaultMessage: 'complete registration',
  },
  surveyDisabledNotVerified: {
    id: 'app.containers.ProjectsShowPage.process.survey.surveyDisabledNotVerified',
    defaultMessage:
      'Taking this survey requires verification of your account. {verificationLink}',
  },
  signUpLinkText: {
    id: 'app.containers.ProjectsShowPage.process.survey.signUpLinkText',
    defaultMessage: 'sign up',
  },
  logInLinkText: {
    id: 'app.containers.ProjectsShowPage.process.survey.logInLinkText',
    defaultMessage: 'log in',
  },
  survey: {
    id: 'app.containers.ProjectsShowPage.process.survey.survey',
    defaultMessage: 'Survey',
  },
  embeddedSurveyScreenReaderWarning: {
    id: 'app.containers.ProjectsShowPage.process.survey.embeddedSurveyScreenReaderWarning',
    defaultMessage:
      ', Warning: The embedded survey may have accessibility issues for screenreader users. If you experience any challenges, please reach out to the platform admin to receive a link to the survey from the original platform. Alternatively, you can request other ways to fill out the survey.',
  },
});
