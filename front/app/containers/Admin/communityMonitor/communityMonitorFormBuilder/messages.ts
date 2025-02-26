import { defineMessages } from 'react-intl';

export default defineMessages({
  survey: {
    id: 'app.containers.AdminPage.ProjectEdit.survey.survey2',
    defaultMessage: 'Survey',
  },
  existingSubmissionsWarning: {
    id: 'app.containers.AdminPage.ProjectEdit.survey.existingSubmissionsWarning',
    defaultMessage:
      'Submissions to this survey have started to come in. Changes to the survey may result in data loss and incomplete data in the exported files.',
  },
  viewSurvey: {
    id: 'app.containers.AdminPage.ProjectEdit.survey.viewSurvey2',
    defaultMessage: 'View survey',
  },
  addSurveyContent: {
    id: 'app.containers.AdminPage.ProjectEdit.survey.addSurveyContent2',
    defaultMessage: 'Add survey content',
  },
  successMessage: {
    id: 'app.containers.AdminPage.ProjectEdit.survey.successMessage2',
    defaultMessage: 'Survey successfully saved',
  },
  supportArticleLink: {
    id: 'app.containers.AdminPage.ProjectEdit.survey.supportArticleLink2',
    defaultMessage:
      'https://support.govocal.com/en/articles/6673873-creating-an-in-platform-survey',
  },
  pagesLogicHelperText: {
    id: 'app.containers.AdminPage.ProjectEdit.survey.pagesLogicHelperText1',
    defaultMessage:
      'If no logic is added, the survey will follow its normal flow. If both the page and its questions have logic, the question logic will take precedence. Ensure this aligns with your intended survey flow. For more information, visit {supportPageLink}',
  },
});
