import { defineMessages } from 'react-intl';

export default defineMessages({
  fieldsReturnedByMethod: {
    id: 'front.app.components.admin.ActionForm.AccessSections.VerificationFieldsModal.fieldsReturnedByMethod',
    defaultMessage: 'Fields returned by {methodName}',
  },
  fieldsReturnedByMethods: {
    id: 'front.app.components.admin.ActionForm.AccessSections.VerificationFieldsModal.fieldsReturnedByMethods',
    defaultMessage: 'Fields returned by sign-in methods',
  },
  whenAParticipantVerifiesThroughMethod: {
    id: 'front.app.components.admin.ActionForm.AccessSections.VerificationFieldsModal.whenAParticipantVerifiesThroughMethod',
    defaultMessage:
      'When a participant verifies through {methodName}, these fields are filled in automatically. Locked fields come straight from the official register and can’t be changed by the participant.',
  },
  multipleMethodsDescription: {
    id: 'front.app.components.admin.ActionForm.AccessSections.VerificationFieldsModal.multipleMethodsDescription',
    defaultMessage:
      'Several sign-in methods are active. These are the fields each of them fills in automatically. Locked fields come straight from the official register and can’t be changed by the participant.',
  },
  noFieldsReturned: {
    id: 'front.app.components.admin.ActionForm.AccessSections.VerificationFieldsModal.noFieldsReturned',
    defaultMessage: 'This method doesn’t return any fields.',
  },
  noActiveMethods: {
    id: 'front.app.components.admin.ActionForm.AccessSections.VerificationFieldsModal.noActiveMethods',
    defaultMessage: 'No sign-in methods are currently active.',
  },
  locked: {
    id: 'front.app.components.admin.ActionForm.AccessSections.VerificationFieldsModal.locked',
    defaultMessage: 'Locked',
  },
  editable: {
    id: 'front.app.components.admin.ActionForm.AccessSections.VerificationFieldsModal.editable',
    defaultMessage: 'Editable',
  },
});
