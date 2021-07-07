import { defineMessages } from 'react-intl';

export default defineMessages({
  nlpFlaggedWarningText: {
    id:
      'app.modules.commercial.flag_inappropriate_content.admin.components.nlpFlaggedWarningText',
    defaultMessage:
      'Inappropriate content auto-detected. You can remove this content flag by selecting this item and clicking the remove button at the top.',
  },
  userFlaggedWarningText: {
    id:
      'app.modules.commercial.flag_inappropriate_content.admin.components.userFlaggedWarningText',
    defaultMessage:
      'Reported as inappropriate by a platform user. You can remove this content flag by selecting this item and clicking the remove button at the top.',
  },
  removeWarning: {
    id:
      'app.modules.commercial.flag_inappropriate_content.admin.components.removeWarning',
    defaultMessage:
      'Remove {numberOfItems, plural, one {content warning} other {# content warnings}}',
  },
  warnings: {
    id:
      'app.modules.commercial.flag_inappropriate_content.admin.components.warnings',
    defaultMessage: 'Content Warnings',
  },
  noWarningItems: {
    id:
      'app.modules.commercial.flag_inappropriate_content.admin.components.noWarningItems',
    defaultMessage:
      'There are no posts reported for review by the community or flagged for inappropriate content by our Natural Language Processing system',
  },
});
