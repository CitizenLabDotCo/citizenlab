import { defineMessages } from 'react-intl';

export default defineMessages({
  emptyTitleError: {
    id: 'app.components.formBuilder.emptyTitleError',
    defaultMessage: 'Provide a question title',
  },

  emptyOptionError: {
    id: 'app.components.formBuilder.emptyOptionError',
    defaultMessage: 'Provide at least 1 answer',
  },
  emptyTitleMessage: {
    id: 'app.components.formBuilder.emptyTitleMessage',
    defaultMessage: 'Provide a title for all the answers',
  },
  emptyStatementError: {
    id: 'app.components.formBuilder.emptyStatementError',
    defaultMessage: 'Provide at least 1 statement',
  },
  emptyTitleStatementMessage: {
    id: 'app.components.formBuilder.emptyTitleStatementMessage',
    defaultMessage: 'Provide a title for all the statements',
  },
  emptyImageOptionError: {
    id: 'app.components.formBuilder.emptyImageOptionError',
    defaultMessage:
      'Provide at least 1 answer. Please note that each answer has to have a title.',
  },
  logicValidationError: {
    id: 'app.components.formBuilder.logicValidationError',
    defaultMessage: 'Logic may not link to prior pages',
  },
  page: {
    id: 'app.components.formBuilder.Page',
    defaultMessage: 'Page',
  },
  helmetTitle: {
    id: 'app.components.formBuilder.helmetTitle',
    defaultMessage: 'Form builder',
  },
});
