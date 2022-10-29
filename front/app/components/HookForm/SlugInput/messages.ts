/*
 * Components.PagesForm Messages
 *
 * This contains all the text for the Pages Form component.
 */

import { defineMessages } from 'react-intl';

export default defineMessages({
  pageUrl: {
    id: 'app.components.HookForm.SlugInput.pageUrl',
    defaultMessage: 'Page URL',
  },
  resultingPageURL: {
    id: 'app.components.HookForm.SlugInput.resultingPageURL',
    defaultMessage: 'Resulting URL',
  },
  brokenURLWarning: {
    id: 'app.components.HookForm.SlugInput.brokenURLWarning',
    defaultMessage:
      'If you change the URL, links to this page using the old URL will no longer work',
  },

  slugTooltip: {
    id: 'app.components.HookForm.SlugInput.slugTooltip',
    defaultMessage:
      "The slug is the unique set of words at the end of page's web address, or URL",
  },
});
