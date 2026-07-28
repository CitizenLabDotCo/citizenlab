import { defineMessages } from 'react-intl';

const PREFIX =
  'front.app.components.admin.ActionForm.AccessSections.IdMethodFieldsModal';

export default defineMessages({
  identificationMethods: {
    id: `${PREFIX}.identificationMethods`,
    defaultMessage: 'Identification methods',
  },
  introDescription: {
    id: `${PREFIX}.introDescription`,
    defaultMessage:
      'These are the identification methods{tooltip} active on this platform, what each of them can be used for, and the fields it fills in automatically. Locked fields come straight from the official register and can’t be changed by the participant.',
  },
  identificationExplanation: {
    id: `${PREFIX}.identificationExplanation`,
    defaultMessage:
      '“Identification” is the umbrella term for both ways a method can be used:',
  },
  authentication: {
    id: `${PREFIX}.authentication`,
    defaultMessage: 'Authentication',
  },
  verification: {
    id: `${PREFIX}.verification`,
    defaultMessage: 'Verification',
  },
  authenticationExplanation: {
    id: `${PREFIX}.authenticationExplanation`,
    defaultMessage:
      'Authentication: participants can create an account and log in with this method.',
  },
  verificationExplanation: {
    id: `${PREFIX}.verificationExplanation`,
    defaultMessage:
      'Verification: the method can be used to prove a participant’s identity through an official register.',
  },
  noFieldsReturned: {
    id: `${PREFIX}.noFieldsReturned`,
    defaultMessage: 'This method doesn’t return any fields.',
  },
  noActiveMethods: {
    id: `${PREFIX}.noActiveMethods`,
    defaultMessage: 'No identification methods are currently active.',
  },
  // These two keep their pre-rename ids on purpose: their copy is unchanged and
  // both are already translated into 34 locales. Re-prefixing them to match the
  // component name would orphan those translations for no gain.
  locked: {
    id: 'front.app.components.admin.ActionForm.AccessSections.VerificationFieldsModal.locked',
    defaultMessage: 'Locked',
  },
  editable: {
    id: 'front.app.components.admin.ActionForm.AccessSections.VerificationFieldsModal.editable',
    defaultMessage: 'Editable',
  },
  canSignUpWith: {
    id: `${PREFIX}.canSignUpWith`,
    defaultMessage:
      'Besides email, participants can sign up with {methodName}.',
  },
  canVerifyWith: {
    id: `${PREFIX}.canVerifyWith`,
    defaultMessage: 'Participants can prove their identity with {methodName}.',
  },
  canSignUpOrVerifyWith: {
    id: `${PREFIX}.canSignUpOrVerifyWith`,
    defaultMessage:
      'Besides email, participants can sign up or prove their identity with {methodName}.',
  },
  seeWhichIdMethodsAreEnabled: {
    id: `${PREFIX}.seeWhichIdMethodsAreEnabled`,
    defaultMessage: 'See which identification methods are enabled',
  },
  viewMethodSettings: {
    id: `${PREFIX}.viewMethodSettings`,
    defaultMessage: 'View {methodName} settings',
  },
});
