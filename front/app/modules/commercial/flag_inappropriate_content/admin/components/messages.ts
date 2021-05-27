import { defineMessages } from 'react-intl';

export default defineMessages({
  warningText: {
    id:
      'app.modules.commercial.flag_inappropriate_content.admin.components.warningText',
    defaultMessage:
      'Warning: possible inappropriate or offensive content detected',
  },
  removeWarning: {
    id:
      'app.modules.commercial.flag_inappropriate_content.admin.components.removeWarning',
    defaultMessage:
      'Remove {numberOfItems, plural, one {warning} other {# warnings}}',
  },
});
