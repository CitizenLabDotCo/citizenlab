import { defineMessages } from 'react-intl';

export default defineMessages({
  userAnonymityLabelMain: {
    id: 'app.containers.AdminPage.ProjectEdit.NativeSurvey.userAnonymityLabelMain2',
    defaultMessage: 'Anonymize all user data',
  },
  userAnonymityLabelSubtext: {
    id: 'app.containers.AdminPage.ProjectEdit.NativeSurvey.userAnonymityLabelSubtext2',
    defaultMessage:
      "All of the survey's inputs from users will be anonymized before being recorded",
  },
  userAnonymityLabelTooltip: {
    id: 'app.containers.AdminPage.ProjectEdit.NativeSurvey.userAnonymityLabelTooltip',
    defaultMessage:
      "Users will still need to comply with participation requirements under the access 'Access Rights' tab. User profile data will not be available in the survey data export.",
  },
  shareInformationOrResults: {
    id: 'app.containers.AdminPage.ProjectEdit.information.shareInformationOrResults',
    defaultMessage: 'Share information or results',
  },
  provideInformation: {
    id: 'app.containers.AdminPage.ProjectEdit.information.provideInformation',
    defaultMessage:
      'Provide information to users, or use the report builder to share results on past phases.',
  },
  new: {
    id: 'app.containers.AdminPage.ProjectEdit.information.new',
    defaultMessage: 'NEW',
  },
});
