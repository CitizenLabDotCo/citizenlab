import { defineMessages } from 'react-intl';

export default defineMessages({
  userAnonymityLabelMain: {
    id: 'app.containers.AdminPage.ProjectEdit.NativeSurvey.userAnonymityLabelMain',
    defaultMessage: 'Anonymise all user data',
  },
  userAnonymityLabelSubtext: {
    id: 'app.containers.AdminPage.ProjectEdit.NativeSurvey.userAnonymityLabelSubtext',
    defaultMessage:
      "All of the survey's inputs from users will be anonymised before being recorded",
  },
  userAnonymityLabelTooltip: {
    id: 'app.containers.AdminPage.ProjectEdit.NativeSurvey.userAnonymityLabelTooltip',
    defaultMessage:
      "Users will still need to comply with participation requirements under the access 'Access Rights' tab. User profile data will not be available in the survey data export.",
  },
});
