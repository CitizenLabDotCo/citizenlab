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
      'Files should not be larger than 50Mb. Added files will be shown on the bottom of this page',
  },
  titleMissingOneLanguageError: {
    id: 'app.components.PagesForm.titleMissingOneLanguageError',
    defaultMessage: 'Provide title for at least one language',
  },
  descriptionMissingOneLanguageError: {
    id: 'app.components.PagesForm.descriptionMissingOneLanguageError',
    defaultMessage: 'Provide content for at least one language',
  },
  savePage: {
    id: 'app.components.PagesForm.savePage',
    defaultMessage: 'Save page',
  },
  savePageSuccessMessage: {
    id: 'app.components.PagesForm.saveSuccess',
    defaultMessage: 'Page successfully saved',
  },
  navbarItemTitle: {
    id: 'app.components.PagesForm.navbarItemTitle',
    defaultMessage: 'Name in navbar',
  },
});
