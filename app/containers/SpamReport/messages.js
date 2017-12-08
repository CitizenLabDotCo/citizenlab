import { defineMessages } from 'react-intl';

export default defineMessages({
  title: {
    id: 'app.containers.SpamReport.title',
    defaultMessage: 'Why do you want to report this as spam?',
  },
  wrong_content: {
    id: 'app.containers.SpamReport.wrong_content',
    defaultMessage: 'This content is not an idea and does not belong here',
  },
  inappropriate: {
    id: 'app.containers.SpamReport.inappropriate',
    defaultMessage: 'I find this content inappropriate or offensive',
  },
  other: {
    id: 'app.containers.SpamReport.other',
    defaultMessage: 'Other reason',
  },
});
