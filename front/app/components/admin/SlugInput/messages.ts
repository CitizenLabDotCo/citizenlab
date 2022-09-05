import { defineMessages } from 'react-intl';

export default defineMessages({
  url: {
    id: 'app.components.admin.SlugInput.url',
    defaultMessage: 'URL',
  },
  urlSlugLabel: {
    id: 'app.components.admin.SlugInput.urlSlugLabel',
    defaultMessage: 'Slug',
  },
  urlSlugTooltip: {
    id: 'app.components.admin.SlugInput.urlSlugTooltip',
    defaultMessage:
      'You can specify the last part of your URL (called the slug). For example, the current URL is {currentURL}, where {currentSlug} is the slug.',
  },
  urlSlugBrokenLinkWarning: {
    id: 'app.components.admin.SlugInput.urlSlugBrokenLinkWarning',
    defaultMessage:
      'If you change the URL, links to the page using the old URL will no longer work.',
  },
  resultingURL: {
    id: 'app.components.admin.SlugInput.resultingURL',
    defaultMessage: 'Resulting URL',
  },
  regexError: {
    id: 'app.components.admin.SlugInput.regexError',
    defaultMessage:
      'The slug can only contain regular, lowercase letters (a-z), numbers (0-9) and hyphens (-). The first and last characters cannot be hyphens. Consecutive hyphens (--) are forbidden.',
  },
});
