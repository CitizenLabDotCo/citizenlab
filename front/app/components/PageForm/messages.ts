/*
 * Components.PagesForm Messages
 *
 * This contains all the text for the Pages Form component.
 */

import { defineMessages } from 'react-intl';

export default defineMessages({
  pageTitle: {
    id: 'app.components.PagesForm.pageTitle',
    defaultMessage: 'Title',
  },
  pageUrl: {
    id: 'app.components.PagesForm.pageUrl',
    defaultMessage: 'Page URL',
  },
  editContent: {
    id: 'app.components.PagesForm.editContent',
    defaultMessage: 'Content',
  },
  fileUploadLabel: {
    id: 'app.components.PagesForm.fileUploadLabel',
    defaultMessage: 'Add files to this page',
  },
  fileUploadLabelTooltip: {
    id: 'app.components.PagesForm.fileUploadLabelTooltip',
    defaultMessage:
      'Files should not be larger than 50Mb. Added files will be shown on the bottom of this page.',
  },
  slugLabelTooltip: {
    id: 'app.components.PagesForm.slugLabelTooltip',
    defaultMessage:
      "You can specify the last part of your page's URL (called the slug). For example, the current page's URL is {currentPageURL}, where {currentPageSlug} is the slug.",
  },
  resultingPageURL: {
    id: 'app.components.PagesForm.resultingPageURL',
    defaultMessage: 'Resulting URL',
  },
  brokenURLWarning: {
    id: 'app.components.PagesForm.brokenURLWarning',
    defaultMessage:
      'If you change the URL, links to this page using the old URL will no longer work.',
  },
  slugRegexErrorMessage: {
    id: 'app.components.PagesForm.slugRegexErrorMessage',
    defaultMessage:
      'The slug can only contain regular, lowercase letters (a-z), numbers (0-9) and hyphens (-). The first and last characters cannot be hyphens. Consecutive hyphens (--) are forbidden.',
  },
  emptySlugErrorMessage: {
    id: 'app.components.PagesForm.emptySlugErrorMessage',
    defaultMessage: 'Please provide a slug.',
  },
  takenSlugErrorMessage: {
    id: 'app.components.pageForm.takenSlugErrorMessage',
    defaultMessage:
      'This slug is already taken. Please choose a different one.',
  },
  emptyTitleErrorMessage: {
    id: 'app.components.PagesForm.emptyTitleErrorMessage',
    defaultMessage: 'Please provide title for all languages.',
  },
  emptyDescriptionErrorMessage: {
    id: 'app.components.PagesForm.emptyDescriptionErrorMessage',
    defaultMessage: 'Please provide description for all languages.',
  },
  savePage: {
    id: 'app.components.PagesForm.save',
    defaultMessage: 'Save page',
  },
});
