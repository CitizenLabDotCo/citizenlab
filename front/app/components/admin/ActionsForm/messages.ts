import { defineMessages } from 'react-intl';

export default defineMessages({
  permissionAction_take_survey_subtitle: {
    id: 'app.containers.AdminPage.groups.permissions.permissionAction_take_survey_subtitle',
    defaultMessage: 'Who can take the survey?',
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
  permissionAction_vote_proposals_subtitle: {
    id: 'app.containers.AdminPage.groups.permissions.permissionAction_vote_proposals_subtitle',
    defaultMessage: 'Who can vote on proposals?',
  },
  permissionAction_comment_proposals_subtitle: {
    id: 'app.containers.AdminPage.groups.permissions.permissionAction_comment_proposals_subtitle',
    defaultMessage: 'Who can comment on proposals?',
  },
  permissionAction_post_proposal_subtitle: {
    id: 'app.containers.AdminPage.groups.permissions.permissionAction_post_proposal_subtitle',
    defaultMessage: 'Who can post a proposal?',
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
  noActionsCanBeTakenInThisProject: {
    id: 'app.containers.AdminPage.groups.permissions.noActionsCanBeTakenInThisProject',
    defaultMessage:
      'Nothing is shown, because there are no actions the user can take in this project.',
  },
  userConfirmationRequiredTooltip: {
    id: 'app.containers.AdminPage.groups.permissions.userConfirmationRequiredTooltip',
    defaultMessage:
      'This option requires the user confirmation feature to be enabled. Contact your GovSuccess manager to enable user confirmation first.',
  },
  permissionsUsersLabel: {
    id: 'app.containers.admin.project.permissions.permissionsUsersLabel',
    defaultMessage: 'All users',
  },
  permissionsUsersLabelDescription: {
    id: 'app.containers.admin.project.permissions.permissionsUsersLabelDescription',
    defaultMessage:
      'Users that have created their accounts with passwords can participate.',
  },
  selectUserGroups: {
    id: 'app.containers.AdminPage.groups.permissions.selectUserGroups',
    defaultMessage: 'Select user groups',
  },
  selectGroups: {
    id: 'app.containers.AdminPage.ProjectEdit.selectGroups',
    defaultMessage: 'Select group(s)',
  },
  permissionEveryoneEmailWarning: {
    id: 'app.containers.admin.project.permissions.permissionEveryoneEmailWarning',
    defaultMessage:
      'In addition to registered users, unregistered users who provide an email and confirm it will be able to take the action. Select this option to lower the barrier for participation.',
  },
  permissionsEmailConfirmLabel: {
    id: 'app.containers.admin.project.permissions.permissionsEmailConfirmLabel',
    defaultMessage: 'Users with confirmed email',
  },
  permissionsEmailConfirmLabelDescription: {
    id: 'app.containers.admin.project.permissions.permissionsEmailConfirmLabelDescription',
    defaultMessage:
      'Anyone can participate after submitting and confirming their email address.',
  },
  permissionsAdminsAndCollaborators: {
    id: 'app.containers.admin.project.permissions.permissionsAdminsAndCollaborators',
    defaultMessage: 'Admins and collaborators only',
  },
  permissionsAdminsAndCollaboratorsTooltip: {
    id: 'app.containers.admin.project.permissions.permissionsAdminsAndCollaboratorsTooltip',
    defaultMessage:
      'Only platform admins, folder managers and project managers can take the action',
  },
  granularPermissionsOffText: {
    id: 'app.containers.AdminPage.groups.permissions.granularPermissionsOffText',
    defaultMessage:
      'Changing granular permissions is not part of your license. Please contact your GovSuccess Manager to learn more about it.',
  },
});
