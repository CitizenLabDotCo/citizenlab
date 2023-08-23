import { defineMessages } from 'react-intl';

export default defineMessages({
  permissionsUsersLabel: {
    id: 'app.containers.admin.project.permissions.permissionsUsersLabel',
    defaultMessage: 'All users',
  },
  permissionsUsersLabelDescription: {
    id: 'app.containers.admin.project.permissions.permissionsUsersLabelDescription',
    defaultMessage:
      'Users that have created their accounts with passwords can participate.',
  },
  permissionsEveryoneEmailLabel: {
    id: 'app.containers.admin.project.permissions.permissionsEveryoneEmailLabel',
    defaultMessage: 'Anyone with a confirmed email address',
  },
  permissionEveryoneEmailWarning: {
    id: 'app.containers.admin.project.permissions.permissionEveryoneEmailWarning',
    defaultMessage:
      'In addition to registered users, unregistered users who provide an email and confirm it will be able to take the action. Select this option to lower the barrier for participation.',
  },
  selectGroups: {
    id: 'app.containers.AdminPage.ProjectEdit.selectGroups',
    defaultMessage: 'Select group(s)',
  },
  noActionsCanBeTakenInThisProject: {
    id: 'app.containers.AdminPage.groups.permissions.noActionsCanBeTakenInThisProject',
    defaultMessage:
      'Nothing is shown, because there are no actions the user can take in this project.',
  },
  granularPermissionsTitle: {
    id: 'app.containers.AdminPage.groups.permissions.granularPermissionsTitle',
    defaultMessage: 'What can different users do?',
  },
  permissionAction_submit_input_subtitle: {
    id: 'app.containers.AdminPage.groups.permissions.permissionAction_submit_input_subtitle',
    defaultMessage: 'Who can submit inputs?',
  },
  permissionAction_reaction_input_subtitle: {
    id: 'app.containers.AdminPage.groups.permissions.permissionAction_reaction_input_subtitle',
    defaultMessage: 'Who can react to inputs?',
  },
  permissionAction_comment_input_subtitle: {
    id: 'app.containers.AdminPage.groups.permissions.permissionAction_comment_inputs_subtitle',
    defaultMessage: 'Who can comment on inputs?',
  },
  permissionAction_comment_proposals_subtitle: {
    id: 'app.containers.AdminPage.groups.permissions.permissionAction_comment_proposals_subtitle',
    defaultMessage: 'Who can comment on proposals?',
  },
  permissionAction_vote_proposals_subtitle: {
    id: 'app.containers.AdminPage.groups.permissions.permissionAction_vote_proposals_subtitle',
    defaultMessage: 'Who can vote on proposals?',
  },
  permissionAction_post_proposal_subtitle: {
    id: 'app.containers.AdminPage.groups.permissions.permissionAction_post_proposal_subtitle',
    defaultMessage: 'Who can post a proposal?',
  },
  permissionAction_take_survey_subtitle: {
    id: 'app.containers.AdminPage.groups.permissions.permissionAction_take_survey_subtitle',
    defaultMessage: 'Who can take the survey?',
  },
  permissionAction_take_poll_subtitle: {
    id: 'app.containers.AdminPage.groups.permissions.permissionAction_take_poll_subtitle',
    defaultMessage: 'Who can take the poll?',
  },
  permissionAction_voting_subtitle: {
    id: 'app.containers.AdminPage.groups.permissions.permissionAction_voting_subtitle',
    defaultMessage: 'Who can vote?',
  },
  permissionAction_annotating_document_subtitle: {
    id: 'app.containers.AdminPage.groups.permissions.permissionAction_annotating_document_subtitle',
    defaultMessage: 'Who can annotate the document?',
  },
  phase: {
    id: 'app.containers.AdminPage.groups.permissions.phase',
    defaultMessage: 'Phase ',
  },
  userFieldsSelectionDescription: {
    id: 'app.containers.AdminPage.groups.permissions.userFieldsSelectionDescription3',
    defaultMessage:
      'Responses to demographic questions will get stored in user profiles. Questions will only be asked to users who have not answered them before. Answers to these questions will also be accessible via the participation data export, which is accessible to both moderators and admins.',
  },
  selectUserGroups: {
    id: 'app.containers.AdminPage.groups.permissions.selectUserGroups',
    defaultMessage: 'Select user groups',
  },
  addQuestion: {
    id: 'app.containers.AdminPage.groups.permissions.addQuestion',
    defaultMessage: 'Add demographic questions',
  },
  userQuestionTitle: {
    id: 'app.containers.AdminPage.groups.permissions.userQuestionTitle',
    defaultMessage: 'Demographic questions asked during participation',
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
  createAQuestion: {
    id: 'app.containers.AdminPage.groups.permissions.createAQuestion',
    defaultMessage: 'Create a question',
  },
  delete: {
    id: 'app.containers.AdminPage.groups.permissions.delete',
    defaultMessage: 'Delete',
  },
  required: {
    id: 'app.containers.AdminPage.groups.permissions.required',
    defaultMessage: 'Required',
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
  fieldType_text: {
    id: 'app.containers.AdminPage.groups.permissions.fieldType_text',
    defaultMessage: 'Short answer',
  },
  fieldType_number: {
    id: 'app.containers.AdminPage.groups.permissions.fieldType_number',
    defaultMessage: 'Numeric value',
  },
  fieldType_multiline_text: {
    id: 'app.containers.AdminPage.groups.permissions.fieldType_multiline_text',
    defaultMessage: 'Long answer',
  },
  fieldType_select: {
    id: 'app.containers.AdminPage.groups.permissions.fieldType_select',
    defaultMessage: 'Multiple choice (select one)',
  },
  fieldType_multiselect: {
    id: 'app.containers.AdminPage.groups.permissions.fieldType_multiselect',
    defaultMessage: 'Multiple choice (select multiple)',
  },
  fieldType_checkbox: {
    id: 'app.containers.AdminPage.groups.permissions.fieldType_checkbox',
    defaultMessage: 'Yes-no (checkbox)',
  },
  fieldType_date: {
    id: 'app.containers.AdminPage.groups.permissions.fieldType_date',
    defaultMessage: 'Date',
  },
  selectValueError: {
    id: 'app.containers.AdminPage.groups.permissions.selectValueError',
    defaultMessage: 'Please select an answer type',
  },
  answerChoices: {
    id: 'app.containers.AdminPage.groups.permissions.answerChoices',
    defaultMessage: 'Answer choices',
  },
  addAnswer: {
    id: 'app.containers.AdminPage.groups.permissions.addAnswer',
    defaultMessage: 'Add answer',
  },
  atLeastOneOptionError: {
    id: 'app.containers.AdminPage.groups.permissions.atLeastOneOptionError',
    defaultMessage: 'At least one choice must be provided',
  },
  option1: {
    id: 'app.containers.AdminPage.groups.permissions.option1',
    defaultMessage: 'Option 1',
  },
  onlyAdmins: {
    id: 'app.containers.AdminPage.groups.permissions.onlyAdmins',
    defaultMessage: 'Only admins can change this setting.',
  },
  premiumUsersOnly: {
    id: 'app.containers.AdminPage.groups.permissions.premiumUsersOnly',
    defaultMessage:
      'Asking custom questions is part of the premium license. Reach out to your GovSuccess Manager to learn more about it.',
  },
});
