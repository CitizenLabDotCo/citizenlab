import { defineMessages } from 'react-intl';

export default defineMessages({
  verifyOostendeRrn: {
    id: 'app.modules.id_oostende_rrn.verifyOostendeRrn',
    defaultMessage: 'Verify using social security number',
  },
  rrnLabel: {
    id: 'app.modules.id_oostende_rrn.rrnLabel',
    defaultMessage: 'Social security number',
  },
  rrnTooltip: {
    id: 'app.modules.id_oostende_rrn.rrnTooltip',
    defaultMessage:
      'We ask your social security number to verify whether you are a citizen of Oostende, older than 14 year old.',
  },
  showOostendeRrnHelp: {
    id: 'app.modules.id_oostende_rrn.showOostendeRrnHelp',
    defaultMessage: 'Where can I find my social security number?',
  },
  oostendeRrnHelp: {
    id: 'app.modules.id_oostende_rrn.oostendeRrnHelp',
    defaultMessage:
      'Your social security number is shown on the back of your digital identity card',
  },
  emptyFieldError: {
    id: 'app.modules.id_oostende_rrn.emptyFieldError',
    defaultMessage: 'This field cannot be empty.',
  },
  invalidRrnError: {
    id: 'app.modules.id_oostende_rrn.invalidRrnError',
    defaultMessage: 'Invalid social security number',
  },
  takenFormError: {
    id: 'app.modules.id_oostende_rrn.takenFormError',
    defaultMessage:
      'Your social security number has already been used to verify another account',
  },
  notEntitledLivesOutsideFormError: {
    id: 'app.modules.id_oostende_rrn.notEntitledLivesOutsideFormError1',
    defaultMessage: "We can't verify you because you live outside of Oostende",
  },
  noMatchFormError: {
    id: 'app.modules.id_oostende_rrn.noMatchFormError',
    defaultMessage:
      "We couldn't find back information on your social security number",
  },
  notEntitledTooYoungFormError: {
    id: 'app.modules.id_oostende_rrn.notEntitledTooYoungFormError',
    defaultMessage: "We can't verify you because you are younger than 14 years",
  },
  somethingWentWrongError: {
    id: 'app.modules.id_oostende_rrn.somethingWentWrongError',
    defaultMessage: "We can't verify you because something went wrong",
  },
  submit: {
    id: 'app.modules.id_oostende_rrn.submit',
    defaultMessage: 'Submit',
  },
  cancel: {
    id: 'app.modules.id_oostende_rrn.cancel',
    defaultMessage: 'Cancel',
  },
});
