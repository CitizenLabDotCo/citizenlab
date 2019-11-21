import { defineMessages } from 'react-intl';

export default defineMessages({
  wrong_content: {
    id: 'app.containers.SpamReport.wrong_content',
    defaultMessage: 'This content does not belong here',
  },
  inappropriate: {
    id: 'app.containers.SpamReport.inappropriate',
    defaultMessage: 'I find this content inappropriate or offensive',
  },
  other: {
    id: 'app.containers.SpamReport.other',
    defaultMessage: 'Other reason',
  },
  otherReasonPlaceholder: {
    id: 'app.containers.SpamReport.otherReasonPlaceholder',
    defaultMessage: 'Description',
  },
  buttonSave: {
    id: 'app.containers.SpamReport.buttonSave',
    defaultMessage: 'Report',
  },
  buttonSuccess: {
    id: 'app.containers.SpamReport.buttonSuccess',
    defaultMessage: 'Success',
  },
  messageSuccess: {
    id: 'app.containers.SpamReport.messageSuccess',
    defaultMessage: 'Your report has been sent',
  },
  messageError: {
    id: 'app.containers.SpamReport.messageError',
    defaultMessage: 'There was an error sending your report, please try again.',
  },
});
