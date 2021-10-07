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
  pageSlug: {
    id: 'app.components.PagesForm.pageSlug',
    defaultMessage: 'Slug',
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
      "You can specify the last part of your page's URL (called the slug).",
  },
  resultingPageURL: {
    id: 'app.components.PagesForm.resultingPageURL',
    defaultMessage: 'Resulting URL',
  },
});
