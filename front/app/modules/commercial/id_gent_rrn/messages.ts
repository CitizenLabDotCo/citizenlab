import { defineMessages } from 'react-intl';

export default defineMessages({
  verifyGentRrn: {
    id: 'app.modules.id_gent_rrn.verifyGentRrn',
    defaultMessage: 'Verify using social security number',
  },
  rrnLabel: {
    id: 'app.modules.id_gent_rrn.rrnLabel',
    defaultMessage: 'Social security number',
  },
  rrnTooltip: {
    id: 'app.modules.id_gent_rrn.rrnTooltip',
    defaultMessage:
      'We ask your social security number to verify whether you are a citizen of Ghent, older than 14 year old.',
  },
  showGentRrnHelp: {
    id: 'app.modules.id_gent_rrn.showGentRrnHelp',
    defaultMessage: 'Where can I find my social security number?',
  },
  gentRrnHelp: {
    id: 'app.modules.id_gent_rrn.gentRrnHelp',
    defaultMessage:
      'Your social security number is shown on the back of your digital identity card',
  },
  emptyFieldError: {
    id: 'app.modules.id_gent_rrn.emptyFieldError',
    defaultMessage: 'This field cannot be empty.',
  },
  invalidRrnError: {
    id: 'app.modules.id_gent_rrn.invalidRrnError',
    defaultMessage: 'Invalid social security number',
  },
  takenFormError: {
    id: 'app.modules.id_gent_rrn.takenFormError',
    defaultMessage:
      'Your social security number has already been used to verify another account',
  },
  noMatchFormError: {
    id: 'app.modules.id_gent_rrn.noMatchFormError',
    defaultMessage:
      "We couldn't find back information on your social security number",
  },
  notEntitledLivesOutsideFormError: {
    id: 'app.modules.id_gent_rrn.notEntitledLivesOutsideFormError',
    defaultMessage: "We can't verify you because you live outside of Ghent",
  },
  notEntitledTooYoungFormError: {
    id: 'app.modules.id_gent_rrn.notEntitledTooYoungFormError',
    defaultMessage: "We can't verify you because you are younger than 14 years",
  },
  somethingWentWrongError: {
    id: 'app.modules.id_gent_rrn.somethingWentWrongError',
    defaultMessage: "We can't verify you because something went wrong",
  },
  submit: {
    id: 'app.modules.id_gent_rrn.submit',
    defaultMessage: 'Submit',
  },
  cancel: {
    id: 'app.modules.id_gent_rrn.cancel',
    defaultMessage: 'Cancel',
  },
});
