import { defineMessages } from 'react-intl';

export default defineMessages({
  intro: {
    id: 'app.components.formBuilder.surveyAssistant.intro',
    defaultMessage:
      'Describe what you want to learn, or attach a document. The assistant proposes the questions, and nothing changes until you approve.',
  },
  starterBikeLanes: {
    id: 'app.components.formBuilder.surveyAssistant.starterBikeLanes',
    defaultMessage:
      'A short survey on how residents feel about new protected bike lanes',
  },
  starterParkRedesign: {
    id: 'app.components.formBuilder.surveyAssistant.starterParkRedesign',
    defaultMessage:
      'Help us prioritise features for the redesign of our central park',
  },
  starterFromDocument: {
    id: 'app.components.formBuilder.surveyAssistant.starterFromDocument',
    defaultMessage: 'Turn the attached plan into a survey for residents',
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
  outlineSummary: {
    id: 'app.components.formBuilder.surveyAssistant.outlineSummary',
    defaultMessage:
      '{pages, plural, one {# page} other {# pages}}, {questions, plural, one {# question} other {# questions}}',
  },
  pageNumber: {
    id: 'app.components.formBuilder.surveyAssistant.pageNumber',
    defaultMessage: 'Page {number}',
  },
  endPage: {
    id: 'app.components.formBuilder.surveyAssistant.endPage',
    defaultMessage: 'End page',
  },
  untitled: {
    id: 'app.components.formBuilder.surveyAssistant.untitled',
    defaultMessage: 'Untitled',
  },
  required: {
    id: 'app.components.formBuilder.surveyAssistant.required',
    defaultMessage: 'Required',
  },
});
