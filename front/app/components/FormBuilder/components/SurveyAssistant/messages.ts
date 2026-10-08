import { defineMessages } from 'react-intl';

export default defineMessages({
  intro: {
    id: 'app.components.formBuilder.surveyAssistant.intro',
    defaultMessage:
      'Describe what you want to learn. The assistant proposes the questions, and nothing changes until you approve.',
  },
  readSurvey: {
    id: 'app.components.formBuilder.surveyAssistant.readSurvey',
    defaultMessage: 'the current survey',
  },
  replaceSurvey: {
    id: 'app.components.formBuilder.surveyAssistant.replaceSurvey',
    defaultMessage: 'new survey questions',
  },
  replaceWarning: {
    id: 'app.components.formBuilder.surveyAssistant.replaceWarning',
    defaultMessage:
      'Approving replaces all current questions and saves the survey. Unsaved changes in the editor are lost.',
  },
});
