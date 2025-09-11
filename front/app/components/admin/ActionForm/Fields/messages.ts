import { defineMessages } from 'react-intl';

export default defineMessages({
  demographicQuestions: {
    id: 'app.containers.Admin.projects.project.permissions.components.PhasePermissionsNew.ActionsFormNew.demographicQuestions',
    defaultMessage: 'Demographic questions asked to participants',
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
  user_fields_in_survey_not_supported_for_participation_method: {
    id: 'app.components.admin.ActionForm.Fields.user_fields_in_survey_not_supported_for_participation_method',
    defaultMessage:
      'Asking demographic questions as the last page of the survey is not supported for the selected participation method.',
  },
  cannot_ask_demographic_fields_with_this_combination_of_permitted_by_and_anonymity:
    {
      id: 'app.components.admin.ActionForm.Fields.cannot_ask_demographic_fields_with_this_combination_of_permitted_by_and_anonymity',
      defaultMessage:
        'With the current combination of "Authentication" and "User data collection" settings, it is not possible to ask demographic questions to users.',
    },
  cannot_ask_demographic_fields_in_registration_flow_when_permitted_by_is_everyone:
    {
      id: 'app.components.admin.ActionForm.Fields.cannot_ask_demographic_fields_in_registration_flow_when_permitted_by_is_everyone',
      defaultMessage:
        'When "Authentication" is set to "None", demographic questions can only be asked as the last page of the survey.',
    },
  with_these_settings_can_only_ask_demographic_fields_in_registration_flow_and_they_wont_be_stored:
    {
      id: 'app.components.admin.ActionForm.Fields.with_these_settings_can_only_ask_demographic_fields_in_registration_flow_and_they_wont_be_stored',
      defaultMessage:
        'With the current settings, demographic questions can only be asked in the registration flow and the answers will not be stored in any way!',
    },
});
