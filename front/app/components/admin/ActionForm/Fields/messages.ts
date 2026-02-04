import { defineMessages } from 'react-intl';

export default defineMessages({
  demographicQuestions: {
    id: 'app.containers.Admin.projects.project.permissions.components.PhasePermissionsNew.ActionsFormNew.demographicQuestions2',
    defaultMessage: 'Demographic questions asked to users',
  },
  edit: {
    id: 'app.containers.Admin.projects.project.permissions.components.PhasePermissionsNew.ActionsFormNew.edit',
    defaultMessage: 'Edit',
  },
  required: {
    id: 'app.containers.Admin.projects.project.permissions.components.PhasePermissionsNew.ActionsFormNew.Fields.EmailModal.required',
    defaultMessage: 'Required',
  },
  addAQuestion: {
    id: 'app.containers.Admin.projects.project.permissions.components.PhasePermissionsNew.ActionsFormNew.Fields.addAQuestion',
    defaultMessage: 'Add a question',
  },
  contactGovSuccessToAccessAddingAQuestion: {
    id: 'app.containers.Admin.projects.project.permissions.components.PhasePermissionsNew.ActionsFormNew.Fields.contactGovSuccessToAccessAddingAQuestion',
    defaultMessage:
      'The ability to add or edit user fields at phase level is not included in your current license. Reach out to your GovSuccess Manager to learn more about it.',
  },
  customFieldNameOptions: {
    id: 'app.containers.Admin.projects.project.permissions.components.PhasePermissionsNew.ActionsFormNew.Fields.customFieldNameOptions',
    defaultMessage: '{customFieldName} options',
  },
  optional: {
    id: 'app.containers.Admin.projects.project.permissions.components.PhasePermissionsNew.ActionsFormNew.Fields.optional',
    defaultMessage: 'Optional',
  },
  fieldStatus: {
    id: 'app.containers.Admin.projects.project.permissions.components.PhasePermissionsNew.ActionsFormNew.Fields.fieldStatus',
    defaultMessage: 'Field status',
  },
  removeField: {
    id: 'app.containers.Admin.projects.project.permissions.components.PhasePermissionsNew.ActionsFormNew.Fields.removeField',
    defaultMessage: 'Remove field',
  },
  requiredGroup: {
    id: 'app.containers.Admin.projects.project.permissions.components.PhasePermissionsNew.ActionsFormNew.Fields.requiredGroup1',
    defaultMessage: 'Required - always enabled because referenced by group',
  },
  optionalGroup: {
    id: 'app.containers.Admin.projects.project.permissions.components.PhasePermissionsNew.ActionsFormNew.Fields.optionalGroup1',
    defaultMessage: 'Optional - always enabled because referenced by group',
  },
  noDemographicQuestions: {
    id: 'app.containers.Admin.projects.project.permissions.components.PhasePermissionsNew.ActionsFormNew.Fields.noDemographicQuestions',
    defaultMessage: 'No demographic questions will be asked.',
  },
  noDemographicQuestionsYet: {
    id: 'app.containers.Admin.projects.project.permissions.components.PhasePermissionsNew.ActionsFormNew.Fields.noDemographicQuestionsYet',
    defaultMessage:
      "No demographic questions have been added yet. Click 'Add a question' to add one.",
  },
  user_fields_in_form_not_supported_for_action: {
    id: 'app.components.admin.ActionForm.Fields.user_fields_in_form_not_supported_for_action',
    defaultMessage:
      'Asking demographic questions as the last page of the form is not supported for this action.',
  },
  with_these_settings_cannot_ask_demographic_fields: {
    id: 'app.components.admin.ActionForm.Fields.with_these_settings_cannot_ask_demographic_fields2',
    defaultMessage:
      'Choosing how demographic questions are asked to participants is not applicable as you have disabled authentication and selected full anonymity',
  },
  cannot_ask_demographic_fields_in_registration_flow_when_permitted_by_is_everyone:
    {
      id: 'app.components.admin.ActionForm.Fields.cannot_ask_demographic_fields_in_registration_flow_when_permitted_by_is_everyone',
      defaultMessage:
        'When "Authentication" is set to "None", demographic questions can only be asked as the last page of the survey.',
    },
  with_these_settings_can_only_ask_demographic_fields_in_registration_flow: {
    id: 'app.components.admin.ActionForm.Fields.with_these_settings_can_only_ask_demographic_fields_in_registration_flow4',
    defaultMessage:
      'Because you selected "Full anonymity" in "User data collection", the answers to the demographic questions asked before participation WILL NOT BE STORED IN THE RESULTS. The answers will only be used to update the user\'s profile, but this profile is not linked to the response. To collect demographic data and store it in the results please choose another option under "User data collection".',
  },
  askDemographicQuestionsBeforeUserParticipates: {
    id: 'app.components.admin.ActionForm.Fields.askDemographicQuestionsBeforeUserParticipates',
    defaultMessage: 'Ask demographic questions before user participates',
  },
  askDemographicQuestionsBeforeUserParticipatesTooltip: {
    id: 'app.components.admin.ActionForm.Fields.askDemographicQuestionsBeforeUserParticipatesTooltip',
    defaultMessage:
      "If the user has already answered these questions, they won't be asked.",
  },
  collectDemographicsByAddingNewPage: {
    id: 'app.components.admin.ActionForm.Fields.collectDemographicsByAddingNewPage2',
    defaultMessage:
      'Collect demographic questions by adding a new page to the end of the form',
  },
  collectDemographicsByAddingNewPageTooltip: {
    id: 'app.components.admin.ActionForm.Fields.collectDemographicsByAddingNewPageTooltip',
    defaultMessage:
      "If this information is already in the user's profile, it will be used to pre-fill these questions.",
  },
  globalRegFlow: {
    id: 'app.components.admin.ActionForm.Fields.globalRegFlow',
    defaultMessage: 'Enabled in global registration flow',
  },
  globalRegFlowTooltip: {
    id: 'app.components.admin.ActionForm.Fields.globalRegFlowTooltip',
    defaultMessage:
      'This question is enabled in the {globalRegFlowLink}. You can disable it for this action.',
  },
  globalRegFlowLink: {
    id: 'app.components.admin.ActionForm.Fields.globalRegFlowLink',
    defaultMessage: 'global registration flow',
  },
});
