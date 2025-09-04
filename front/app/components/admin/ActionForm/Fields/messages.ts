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
  notAllowed: {
    id: 'app.containers.Admin.projects.project.permissions.components.PhasePermissionsNew.ActionsFormNew.Fields.notAllowed',
    defaultMessage:
      "When authentication is set to 'None', it is not allowed to ask demographic questions in the registration flow. Please select 'Include demographic questions as last page of the survey' in order to add demographic questions.",
  },
});
