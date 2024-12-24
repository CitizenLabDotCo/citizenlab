import { defineMessages } from 'react-intl';

export default defineMessages({
  extraQuestions: {
    id: 'app.containers.Admin.projects.project.permissions.components.PhasePermissionsNew.ActionsFormNew.extraQuestions',
    defaultMessage: 'Extra questions asked to participants',
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
  noExtraQuestions: {
    id: 'app.containers.Admin.projects.project.permissions.components.PhasePermissionsNew.ActionsFormNew.Fields.noExtraQuestions',
    defaultMessage: 'No extra questions will be asked.',
  },
});
