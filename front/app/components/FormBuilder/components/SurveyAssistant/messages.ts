import { defineMessages } from 'react-intl';

export default defineMessages({
  intro2: {
    id: 'app.components.formBuilder.surveyAssistant.intro2',
    defaultMessage:
      'Describe what you want to learn, or attach a document. The assistant proposes the questions, and nothing changes until you approve.',
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
  editingLocked: {
    id: 'app.components.formBuilder.surveyAssistant.editingLocked',
    defaultMessage:
      'You can edit the survey again once the assistant is done, or once you approve or reject its proposal.',
  },
});
