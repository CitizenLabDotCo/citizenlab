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
  dontChange: {
    id: 'app.components.PagesForm.dontChange',
    defaultMessage:
      "Don't change this! (unless you really know what you're doing)",
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
});
