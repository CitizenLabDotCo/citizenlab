import { defineMessages } from 'react-intl';

export default defineMessages({
  fieldsReturnedByMethod: {
    id: 'front.app.components.admin.ActionForm.AccessSections.VerificationFieldsModal.fieldsReturnedByMethod',
    defaultMessage: 'Fields returned by {methodName}',
  },
  whenAParticipantVerifiesThroughMethod: {
    id: 'front.app.components.admin.ActionForm.AccessSections.VerificationFieldsModal.whenAParticipantVerifiesThroughMethod',
    defaultMessage:
      'When a participant verifies through {methodName}, these fields are filled in automatically. Locked fields come straight from the official register and can’t be changed by the participant.',
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
