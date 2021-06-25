import { defineMessages } from 'react-intl';

export default defineMessages({
  nlpFlaggedWarningText: {
    id:
      'app.modules.commercial.flag_inappropriate_content.admin.components.nlpFlaggedWarningText',
    defaultMessage: 'Inappropriate content auto-detected',
  },
  userFlaggedWarningText: {
    id:
      'app.modules.commercial.flag_inappropriate_content.admin.components.userFlaggedWarningText',
    defaultMessage: 'Reported: {reason}',
  },
  removeWarning: {
    id:
      'app.modules.commercial.flag_inappropriate_content.admin.components.removeWarning',
    defaultMessage:
      'Remove {numberOfItems, plural, one {warning} other {# warnings}}',
  },
  warnings: {
    id:
      'app.modules.commercial.flag_inappropriate_content.admin.components.warnings',
    defaultMessage: 'Warnings',
  },
  inappropriate: {
    id:
      'app.modules.commercial.flag_inappropriate_content.admin.components.inappropriate',
    defaultMessage: 'inappropriate or offensive',
  },
  wrong: {
    id:
      'app.modules.commercial.flag_inappropriate_content.admin.components.wrong',
    defaultMessage: 'irrelevant',
  },
  warningTooltip: {
    id:
      'app.modules.commercial.flag_inappropriate_content.admin.components.warningTooltip',
    defaultMessage:
      'Not inappropriate? Remove this designation in the Warnings tab.',
  },
});
