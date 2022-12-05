import { defineMessages } from 'react-intl';

export default defineMessages({
  url: {
    id: 'app.components.admin.SlugInput.url',
    defaultMessage: 'URL',
  },
  urlSlugTooltip: {
    id: 'app.components.admin.SlugInput.urlSlugTooltip',
    defaultMessage:
      'You can specify the last part of your URL (called the slug). For example, the current URL is {currentURL}, where {currentSlug} is the slug.',
  },
  regexError: {
    id: 'app.components.admin.SlugInput.regexError',
    defaultMessage:
      'The slug can only contain regular, lowercase letters (a-z), numbers (0-9) and hyphens (-). The first and last characters cannot be hyphens. Consecutive hyphens (--) are forbidden.',
  },
});
