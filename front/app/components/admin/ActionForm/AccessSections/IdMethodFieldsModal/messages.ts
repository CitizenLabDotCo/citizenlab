import { defineMessages } from 'react-intl';

export default defineMessages({
  fieldsReturnedByMethod: {
    id: 'front.app.components.admin.ActionForm.AccessSections.IdMethodFieldsModal.fieldsReturnedByMethod',
    defaultMessage: 'Fields returned by {methodName}',
  },
  fieldsReturnedByMethods: {
    id: 'front.app.components.admin.ActionForm.AccessSections.IdMethodFieldsModal.fieldsReturnedByMethods',
    defaultMessage: 'Fields returned by identification methods',
  },
  whenAParticipantVerifiesThroughMethod: {
    id: 'front.app.components.admin.ActionForm.AccessSections.IdMethodFieldsModal.whenAParticipantVerifiesThroughMethod',
    defaultMessage:
      'When a participant identifies through {methodName}, these fields are filled in automatically. Locked fields come straight from the official register and can’t be changed by the participant.',
  },
  multipleMethodsDescription: {
    id: 'front.app.components.admin.ActionForm.AccessSections.IdMethodFieldsModal.multipleMethodsDescription',
    defaultMessage:
      'Several identification methods are active. These are the fields each of them fills in automatically. Locked fields come straight from the official register and can’t be changed by the participant.',
  },
  noFieldsReturned: {
    id: 'front.app.components.admin.ActionForm.AccessSections.IdMethodFieldsModal.noFieldsReturned',
    defaultMessage: 'This method doesn’t return any fields.',
  },
  noActiveMethods: {
    id: 'front.app.components.admin.ActionForm.AccessSections.IdMethodFieldsModal.noActiveMethods',
    defaultMessage: 'No identification methods are currently active.',
  },
  locked: {
    id: 'front.app.components.admin.ActionForm.AccessSections.IdMethodFieldsModal.locked',
    defaultMessage: 'Locked',
  },
  editable: {
    id: 'front.app.components.admin.ActionForm.AccessSections.IdMethodFieldsModal.editable',
    defaultMessage: 'Editable',
  },
  seeWhichIdMethodsAreEnabled: {
    id: 'front.app.components.admin.ActionForm.AccessSections.IdMethodFieldsModal.seeWhichIdMethodsAreEnabled',
    defaultMessage: 'See which identification methods are enabled',
  },
  viewMethodSettings: {
    id: 'front.app.components.admin.ActionForm.AccessSections.IdMethodFieldsModal.viewMethodSettings',
    defaultMessage: 'View {methodName} settings',
  },
});
