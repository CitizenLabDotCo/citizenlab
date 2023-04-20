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
  permissionAction_comment_ideas: {
    id: 'app.containers.AdminPage.groups.permissions.permissionAction_comment_ideas',
    defaultMessage: 'Comment on ideas',
  },
  permissionAction_comment_projects: {
    id: 'app.containers.AdminPage.groups.permissions.permissionAction_comment_projects',
    defaultMessage: 'Comment on projects',
  },
  permissionAction_comment_contributions: {
    id: 'app.containers.AdminPage.groups.permissions.permissionAction_comment_contributions',
    defaultMessage: 'Comment on contributions',
  },
  permissionAction_comment_options: {
    id: 'app.containers.AdminPage.groups.permissions.permissionAction_comment_options',
    defaultMessage: 'Comment on options',
  },
  permissionAction_comment_questions: {
    id: 'app.containers.AdminPage.groups.permissions.permissionAction_comment_questions',
    defaultMessage: 'Comment on questions',
  },
  permissionAction_comment_issues: {
    id: 'app.containers.AdminPage.groups.permissions.permissionAction_comment_issues',
    defaultMessage: 'Comment on issues',
  },
  permissionAction_vote_ideas: {
    id: 'app.containers.AdminPage.groups.permissions.permissionAction_vote_ideas',
    defaultMessage: 'Vote on ideas',
  },
  permissionAction_vote_projects: {
    id: 'app.containers.AdminPage.groups.permissions.permissionAction_vote_projects',
    defaultMessage: 'Vote on projects',
  },
  permissionAction_vote_contributions: {
    id: 'app.containers.AdminPage.groups.permissions.permissionAction_vote_contributions',
    defaultMessage: 'Vote on contributions',
  },
  permissionAction_vote_options: {
    id: 'app.containers.AdminPage.groups.permissions.permissionAction_vote_options',
    defaultMessage: 'Vote on options',
  },
  permissionAction_vote_questions: {
    id: 'app.containers.AdminPage.groups.permissions.permissionAction_vote_questions',
    defaultMessage: 'Vote on questions',
  },
  permissionAction_vote_issues: {
    id: 'app.containers.AdminPage.groups.permissions.permissionAction_vote_issues',
    defaultMessage: 'Vote on issues',
  },
  permissionAction_submit_idea: {
    id: 'app.containers.AdminPage.groups.permissions.permissionAction_submit_idea',
    defaultMessage: 'Submit your idea',
  },
  permissionAction_submit_project: {
    id: 'app.containers.AdminPage.groups.permissions.permissionAction_submit_project',
    defaultMessage: 'Submit your project',
  },
  permissionAction_submit_contribution: {
    id: 'app.containers.AdminPage.groups.permissions.permissionAction_submit_contribution',
    defaultMessage: 'Submit your contribution',
  },
  permissionAction_submit_option: {
    id: 'app.containers.AdminPage.groups.permissions.permissionAction_submit_option',
    defaultMessage: 'Submit your option',
  },
  permissionAction_submit_question: {
    id: 'app.containers.AdminPage.groups.permissions.permissionAction_submit_question',
    defaultMessage: 'Submit your question',
  },
  permissionAction_submit_issue: {
    id: 'app.containers.AdminPage.groups.permissions.permissionAction_submit_issue',
    defaultMessage: 'Submit your issue',
  },
  permissionAction_comment_proposals: {
    id: 'app.containers.AdminPage.groups.permissions.permissionAction_comment_proposal',
    defaultMessage: 'Comment on proposals',
  },
  permissionAction_vote_proposals: {
    id: 'app.containers.AdminPage.groups.permissions.permissionAction_vote_proposal',
    defaultMessage: 'Vote on proposals',
  },
  permissionAction_post_proposal: {
    id: 'app.containers.AdminPage.groups.permissions.permissionAction_post_proposal',
    defaultMessage: 'Post a proposal',
  },
  permissionAction_take_survey: {
    id: 'app.containers.AdminPage.groups.permissions.permissionAction_take_survey',
    defaultMessage: 'Take the survey',
  },
  permissionAction_take_poll: {
    id: 'app.containers.AdminPage.groups.permissions.permissionAction_take_poll',
    defaultMessage: 'Take the poll',
  },
  permissionAction_budgeting: {
    id: 'app.containers.AdminPage.groups.permissions.permissionAction_budgeting',
    defaultMessage: 'Spending budget',
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
  permissionAction_submit_idea_subtitle: {
    id: 'app.containers.AdminPage.groups.permissions.permissionAction_submit_idea_subtitle',
    defaultMessage: 'Who can submit ideas?',
  },
  permissionAction_submit_project_subtitle: {
    id: 'app.containers.AdminPage.groups.permissions.permissionAction_submit_project_subtitle',
    defaultMessage: 'Who can submit projects?',
  },
  permissionAction_submit_contribution_subtitle: {
    id: 'app.containers.AdminPage.groups.permissions.permissionAction_submit_contribution_subtitle',
    defaultMessage: 'Who can submit contributions?',
  },
  permissionAction_submit_option_subtitle: {
    id: 'app.containers.AdminPage.groups.permissions.permissionAction_submit_option_subtitle',
    defaultMessage: 'Who can submit options?',
  },
  permissionAction_submit_question_subtitle: {
    id: 'app.containers.AdminPage.groups.permissions.permissionAction_submit_question_subtitle',
    defaultMessage: 'Who can submit questions?',
  },
  permissionAction_submit_issue_subtitle: {
    id: 'app.containers.AdminPage.groups.permissions.permissionAction_submit_issue_subtitle',
    defaultMessage: 'Who can submit issues?',
  },
  permissionAction_vote_ideas_subtitle: {
    id: 'app.containers.AdminPage.groups.permissions.permissionAction_vote_ideas_subtitle',
    defaultMessage: 'Who can vote on ideas?',
  },
  permissionAction_vote_projects_subtitle: {
    id: 'app.containers.AdminPage.groups.permissions.permissionAction_vote_projects_subtitle',
    defaultMessage: 'Who can vote on projects?',
  },
  permissionAction_vote_contributions_subtitle: {
    id: 'app.containers.AdminPage.groups.permissions.permissionAction_vote_contributions_subtitle',
    defaultMessage: 'Who can vote on contributions?',
  },
  permissionAction_vote_options_subtitle: {
    id: 'app.containers.AdminPage.groups.permissions.permissionAction_vote_options_subtitle',
    defaultMessage: 'Who can vote on options?',
  },
  permissionAction_vote_questions_subtitle: {
    id: 'app.containers.AdminPage.groups.permissions.permissionAction_vote_questions_subtitle',
    defaultMessage: 'Who can vote on questions?',
  },
  permissionAction_vote_issues_subtitle: {
    id: 'app.containers.AdminPage.groups.permissions.permissionAction_vote_issues_subtitle',
    defaultMessage: 'Who can vote on issues?',
  },
  permissionAction_comment_ideas_subtitle: {
    id: 'app.containers.AdminPage.groups.permissions.permissionAction_comment_ideas_subtitle',
    defaultMessage: 'Who can comment on ideas?',
  },
  permissionAction_comment_projects_subtitle: {
    id: 'app.containers.AdminPage.groups.permissions.permissionAction_comment_projects_subtitle',
    defaultMessage: 'Who can comment on projects?',
  },
  permissionAction_comment_contributions_subtitle: {
    id: 'app.containers.AdminPage.groups.permissions.permissionAction_comment_contributions_subtitle',
    defaultMessage: 'Who can comment on contributions?',
  },
  permissionAction_comment_options_subtitle: {
    id: 'app.containers.AdminPage.groups.permissions.permissionAction_comment_options_subtitle',
    defaultMessage: 'Who can comment on options?',
  },
  permissionAction_comment_questions_subtitle: {
    id: 'app.containers.AdminPage.groups.permissions.permissionAction_comment_questions_subtitle',
    defaultMessage: 'Who can comment on questions?',
  },
  permissionAction_comment_issues_subtitle: {
    id: 'app.containers.AdminPage.groups.permissions.permissionAction_comment_issues_subtitle',
    defaultMessage: 'Who can comment on issues?',
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
  permissionAction_budgeting_subtitle: {
    id: 'app.containers.AdminPage.groups.permissions.permissionAction_budgeting_subtitle',
    defaultMessage: 'Who can spend the budget?',
  },
  phase: {
    id: 'app.containers.AdminPage.groups.permissions.phase',
    defaultMessage: 'Phase ',
  },
  userFieldsSelectionDescription: {
    id: 'app.containers.AdminPage.groups.permissions.userFieldsSelectionDescription',
    defaultMessage:
      'Responses to demographic questions will get stored in user profiles. Answers to these questions will be accessible to both admins and moderators to easy participation analysis. Questions will only be asked to users who have not answered them before.',
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
});
