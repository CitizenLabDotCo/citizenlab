import { defineMessages } from 'react-intl';

export default defineMessages({
  title: {
    id: 'app.components.formBuilder.editWarningModal.title2',
    defaultMessage: 'Edit fields',
  },
  exportYouResponses: {
    id: 'app.components.formBuilder.editWarningModal.exportYouResponses2',
    defaultMessage: 'export your responses.',
  },
  loseDataWarning: {
    id: 'app.components.formBuilder.editWarningModal.loseDataWarning2',
    defaultMessage:
      'Warning: You might lose response data forever. Before continuing, ',
  },
  deteleAQuestion: {
    id: 'app.components.formBuilder.editWarningModal.deteleAQuestion',
    defaultMessage: 'Delete a question',
  },
  deleteAQuestionDescription: {
    id: 'app.components.formBuilder.editWarningModal.deleteAQuestionDescription',
    defaultMessage: "You'll lose response data linked to that question",
  },
  addOrReorder: {
    id: 'app.components.formBuilder.editWarningModal.addOrReorder',
    defaultMessage: 'Add or reorder questions',
  },
  addOrReorderDescription: {
    id: 'app.components.formBuilder.editWarningModal.addOrReorderDescription',
    defaultMessage: 'Your response data may be inaccurate',
  },
  changeQuestionText: {
    id: 'app.components.formBuilder.editWarningModal.changeQuestionText',
    defaultMessage: 'Change question text',
  },
  changeQuestionTextDescription: {
    id: 'app.components.formBuilder.editWarningModal.changeQuestionTextDescription',
    defaultMessage: "Fixing a typo? It won't affect your response data",
  },
  noCancel: {
    id: 'app.components.formBuilder.editWarningModal.noCancel',
    defaultMessage: 'No, cancel',
  },
  yesContinue: {
    id: 'app.components.formBuilder.editWarningModal.yesContinue',
    defaultMessage: 'Yes, continue',
  },
});
