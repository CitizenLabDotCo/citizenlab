import { defineMessages } from 'react-intl';

export default defineMessages({
  // index
  premiumUsersOnly: {
    id: 'app.containers.AdminPage.groups.permissions.premiumUsersOnly',
    defaultMessage:
      'Asking custom questions is part of the premium license. Reach out to your GovSuccess Manager to learn more about it.',
  },
  userQuestionTitle: {
    id: 'app.containers.AdminPage.groups.permissions.userQuestionTitle',
    defaultMessage: 'Demographic questions asked during participation',
  },
  userFieldsSelectionDescription: {
    id: 'app.containers.AdminPage.groups.permissions.userFieldsSelectionDescription',
    defaultMessage:
      'Responses to demographic questions will get stored in user profiles. Questions will only be asked to users who have not answered them before. Answers to these questions will also be accessible via the participation data export, which is accessible to both project managers and admins.',
  },
  useExistingRegistrationQuestions: {
    id: 'app.containers.AdminPage.groups.permissions.useExistingRegistrationQuestions',
    defaultMessage: 'Ask platform level registration questions',
  },
  useExistingRegistrationQuestionsDescription: {
    id: 'app.containers.AdminPage.groups.permissions.useExistingRegistrationQuestionsDescription',
    defaultMessage:
      'Use this setting if collecting name, last name, and answers to platform level demographic questions is important to you. It may increase the barrier for participation.',
  },
  required: {
    id: 'app.containers.AdminPage.groups.permissions.required',
    defaultMessage: 'Required',
  },
  delete: {
    id: 'app.containers.AdminPage.groups.permissions.delete',
    defaultMessage: 'Delete',
  },
  addQuestion: {
    id: 'app.containers.AdminPage.groups.permissions.addQuestion',
    defaultMessage: 'Add demographic questions',
  },

  // AddFieldScreen
  atLeastOneOptionError: {
    id: 'app.containers.AdminPage.groups.permissions.atLeastOneOptionError',
    defaultMessage: 'At least one choice must be provided',
  },
  emptyTitleErrorMessage: {
    id: 'app.containers.AdminPage.groups.permissions.emptyTitleErrorMessage',
    defaultMessage: 'Please provide a title for all choices',
  },
  selectValueError: {
    id: 'app.containers.AdminPage.groups.permissions.selectValueError',
    defaultMessage: 'Please select an answer type',
  },
  missingTitleLocaleError: {
    id: 'app.containers.AdminPage.groups.permissions.missingTitleLocaleError',
    defaultMessage: 'Please fill in the title in all languages',
  },
  answerFormat: {
    id: 'app.containers.AdminPage.groups.permissions.answerFormat',
    defaultMessage: 'Answer format',
  },
  questionTitle: {
    id: 'app.containers.AdminPage.groups.permissions.questionTitle',
    defaultMessage: 'Question title',
  },
  questionDescription: {
    id: 'app.containers.AdminPage.groups.permissions.questionDescription',
    defaultMessage: 'Question description',
  },
  answerChoices: {
    id: 'app.containers.AdminPage.groups.permissions.answerChoices',
    defaultMessage: 'Answer choices',
  },
  addAnswer: {
    id: 'app.containers.AdminPage.groups.permissions.addAnswer',
    defaultMessage: 'Add answer',
  },
  createAQuestion: {
    id: 'app.containers.AdminPage.groups.permissions.createAQuestion',
    defaultMessage: 'Create a question',
  },

  // FieldSelectionModal
  option1: {
    id: 'app.containers.AdminPage.groups.permissions.option1',
    defaultMessage: 'Option 1',
  },

  // SelectionScreen
  select: {
    id: 'app.containers.AdminPage.groups.permissions.select',
    defaultMessage: 'Select',
  },
  defaultField: {
    id: 'app.containers.AdminPage.groups.permissions.defaultField',
    defaultMessage: 'Default field',
  },
  createANewQuestion: {
    id: 'app.containers.AdminPage.groups.permissions.createANewQuestion',
    defaultMessage: 'Create a new question',
  },
  onlyAdminsCreateQuestion: {
    id: 'app.containers.AdminPage.groups.permissions.onlyAdminsCreateQuestion',
    defaultMessage: 'Only admins can create a new question.',
  },
});
