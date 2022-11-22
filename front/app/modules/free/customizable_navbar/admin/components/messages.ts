import { defineMessages } from 'react-intl';

export default defineMessages({
  tabNavigation: {
    id: 'app.modules.navbar.admin.components.tabNavigation',
    defaultMessage: 'Navigation',
  },
  navbarItemTitle: {
    id: 'app.modules.free.customizable_navbar.admin.components.NavbarTitleField.navbarItemTitle',
    defaultMessage: 'Name in navbar',
  },
  emptyNavbarItemTitleError: {
    id: 'app.modules.free.customizable_navbar.admin.components.NavbarTitleField.emptyNavbarItemTitleError',
    defaultMessage:
      "The 'Name in navbar' field is required. If your platform has multiple languages, check that all languages are filled in.",
  },
  pageTitle: {
    id: 'app.modules.free.customizable_navbar.pageTitle',
    defaultMessage: 'Title',
  },
  pageUrl: {
    id: 'app.modules.free.customizable_navbar.pageUrl',
    defaultMessage: 'Page URL',
  },
  editContent: {
    id: 'app.modules.free.customizable_navbar.editContent',
    defaultMessage: 'Content',
  },
  fileUploadLabel: {
    id: 'app.modules.free.customizable_navbar.fileUploadLabel',
    defaultMessage: 'Add files to this page',
  },
  fileUploadLabelTooltip: {
    id: 'app.modules.free.customizable_navbar.fileUploadLabelTooltip',
    defaultMessage:
      'Files should not be larger than 50Mb. Added files will be shown on the bottom of this page.',
  },
  slugLabelTooltip: {
    id: 'app.modules.free.customizable_navbar.slugLabelTooltip',
    defaultMessage:
      "You can specify the last part of your page's URL (called the slug). For example, the current page's URL is {currentPageURL}, where {currentPageSlug} is the slug.",
  },
  resultingPageURL: {
    id: 'app.modules.free.customizable_navbar.resultingPageURL',
    defaultMessage: 'Resulting URL',
  },
  brokenURLWarning: {
    id: 'app.modules.free.customizable_navbar.brokenURLWarning',
    defaultMessage:
      'If you change the URL, links to this page using the old URL will no longer work',
  },
  slugRegexError: {
    id: 'app.modules.free.customizable_navbar.slugRegexError',
    defaultMessage:
      'The slug can only contain regular, lowercase letters (a-z), numbers (0-9) and hyphens (-). The first and last characters cannot be hyphens. Consecutive hyphens (--) are forbidden',
  },
  emptySlugError: {
    id: 'app.modules.free.customizable_navbar.emptySlugError',
    defaultMessage: 'Provide a slug',
  },
  takenSlugError: {
    id: 'app.modules.free.customizable_navbar.takenSlugError',
    defaultMessage: 'This slug is already taken. Choose a different one.',
  },
  emptyTitleError: {
    id: 'app.modules.free.customizable_navbar.emptyTitleError',
    defaultMessage: 'Provide title for all languages',
  },
  emptyDescriptionError: {
    id: 'app.modules.free.customizable_navbar.emptyDescriptionError',
    defaultMessage: 'Provide content for all languages',
  },
  savePage: {
    id: 'app.modules.free.customizable_navbar.admin.components.NavbarTitleField.savePage',
    defaultMessage: 'Save page',
  },
  savePageSuccessMessage: {
    id: 'app.modules.free.customizable_navbar.admin.components.NavbarTitleField.saveSuccess',
    defaultMessage: 'Page successfully saved',
  },
});
