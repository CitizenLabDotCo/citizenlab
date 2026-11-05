import { defineMessages } from 'react-intl';

export default defineMessages({
  title: {
    id: 'app.components.formBuilder.formInputEditWarningModal.title',
    defaultMessage: 'Edit Input form',
  },
  loseDataWarning: {
    id: 'app.components.formBuilder.formInputEditWarningModal.loseDataWarning',
    defaultMessage:
      'Warning: Ideation, voting, and budgeting phases in this project share a single input form. Any edits you make here will apply to all of them.',
  },
  deleteAQuestion: {
    id: 'app.components.formBuilder.formInputEditWarningModal.deleteAQuestion',
    defaultMessage: 'Delete a question',
  },
  deleteAQuestionDescription: {
    id: 'app.components.formBuilder.formInputEditWarningModal.deleteAQuestionDescription',
    defaultMessage:
      "You'll lose response data linked to that question in all phases using the same form",
  },
  addOrReorder: {
    id: 'app.components.formBuilder.formInputEditWarningModal.addOrReorder',
    defaultMessage: 'Add or reorder questions',
  },
  addOrReorderDescription: {
    id: 'app.components.formBuilder.formInputEditWarningModal.addOrReorderDescription',
    defaultMessage: 'Your response data may be inaccurate',
  },
  changeQuestionText: {
    id: 'app.components.formBuilder.formInputEditWarningModal.changeQuestionText',
    defaultMessage: 'Edit text',
  },
  changeQuestionTextDescription: {
    id: 'app.components.formBuilder.formInputEditWarningModal.changeQuestionTextDescription',
    defaultMessage: "Fixing a typo? It won't affect your response data",
  },
  noCancel: {
    id: 'app.components.formBuilder.formInputEditWarningModal.noCancel',
    defaultMessage: 'No, cancel',
  },
  yesContinue: {
    id: 'app.components.formBuilder.formInputEditWarningModal.yesContinue',
    defaultMessage: 'Yes, continue',
  },
});
