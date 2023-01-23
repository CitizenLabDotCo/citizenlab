import { defineMessages } from 'react-intl';

export default defineMessages({
  urlSlugLabel: {
    id: 'app.components.admin.SlugInput.urlSlugLabel',
    defaultMessage: 'Slug',
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
  slugTooltip: {
    id: 'app.components.admin.SlugInput.slugTooltip',
    defaultMessage:
      "The slug is the unique set of words at the end of page's web address, or URL.",
  },
});
