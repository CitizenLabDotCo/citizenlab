import { defineMessages } from 'react-intl';

export default defineMessages({
  regexError: {
    id: 'app.components.admin.SlugInput.regexError',
    defaultMessage:
      'The slug can only contain regular, lowercase letters (a-z), numbers (0-9) and hyphens (-). The first and last characters cannot be hyphens. Consecutive hyphens (--) are forbidden.',
  },
});
