import { defineMessages } from 'react-intl';

export default defineMessages({
  surveyDisabledProjectInactive: {
    id: 'app.containers.ProjectsShowPage.process.survey.surveyDisabledProjectInactive',
    defaultMessage: 'The survey is no longer available, since this proect is no longer active.',
  },
  surveyDisabledNotPermitted: {
    id: 'app.containers.ProjectsShowPage.process.survey.surveyDisabledNotPermitted',
    defaultMessage: 'Unfortunately, you don\'t have the rights to take this survey.',
  },
  surveyDisabledMaybeNotPermitted: {
    id: 'app.containers.ProjectsShowPage.process.survey.surveyDisabledMaybeNotPermitted',
    defaultMessage: 'Only certain users can take this survey. Please sign in first.',
  },
  surveyDisabledNotPossible: {
    id: 'app.containers.ProjectsShowPage.process.survey.surveyDisabledNotPossible',
    defaultMessage: 'It is currently impossible to take this survey.',
  },
  surveyDisabledNotActivePhase: {
    id: 'app.containers.ProjectsShowPage.process.survey.surveyDisabledNotActivePhase',
    defaultMessage: 'This survey can only be taken when this phase in the timeline is active.',
  },
  verificationLinkText: {
    id: 'app.containers.Comments.verificationLinkText',
    defaultMessage: 'Verify your account now.',
  },
  surveyDisabledNotVerified: {
    id: 'app.containers.Projects.PollForm.surveyDisabledNotVerified',
    defaultMessage: 'Taking this survey requires verification of your account. {verificationLink}',
  },
});
