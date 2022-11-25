import { defineMessages } from 'react-intl';

export default defineMessages({
  shownOnPage: {
    id: 'app.containers.Admin.PagesAndMenu.PageShownBadge.shownOnPage',
    defaultMessage: 'Shown on page',
  },
  notShownOnPage: {
    id: 'app.containers.Admin.PagesAndMenu.PageShownBadge.notShownOnPage',
    defaultMessage: 'Not shown on page',
  },
  tabNavigation: {
    id: 'app.containers.Admin.PagesAndMenu.components.tabNavigation',
    defaultMessage: 'Navigation',
  },
  navbarItemTitle: {
    id: 'app.containers.Admin.PagesAndMenu.components.NavbarItemForm.navbarItemTitle',
    defaultMessage: 'Name in navbar',
  },
  pageTitle: {
    id: 'app.containers.Admin.PagesAndMenu.components.pageTitle',
    defaultMessage: 'Title',
  },
  pageUrl: {
    id: 'app.containers.Admin.PagesAndMenu.components.pageUrl',
    defaultMessage: 'Page URL',
  },
  editContent: {
    id: 'app.containers.Admin.PagesAndMenu.components.editContent',
    defaultMessage: 'Content',
  },
  fileUploadLabel: {
    id: 'app.containers.Admin.PagesAndMenu.components.fileUploadLabel',
    defaultMessage: 'Add files to this page',
  },
  fileUploadLabelTooltip: {
    id: 'app.containers.Admin.PagesAndMenu.components.fileUploadLabelTooltip',
    defaultMessage:
      'Files should not be larger than 50Mb. Added files will be shown on the bottom of this page.',
  },
  slugLabelTooltip: {
    id: 'app.containers.Admin.PagesAndMenu.components.slugLabelTooltip',
    defaultMessage:
      "You can specify the last part of your page's URL (called the slug). For example, the current page's URL is {currentPageURL}, where {currentPageSlug} is the slug.",
  },
  resultingPageURL: {
    id: 'app.containers.Admin.PagesAndMenu.components.resultingPageURL',
    defaultMessage: 'Resulting URL',
  },
  brokenURLWarning: {
    id: 'app.containers.Admin.PagesAndMenu.components.brokenURLWarning',
    defaultMessage:
      'If you change the URL, links to this page using the old URL will no longer work',
  },
  slugRegexError: {
    id: 'app.containers.Admin.PagesAndMenu.components.slugRegexError',
    defaultMessage:
      'The slug can only contain regular, lowercase letters (a-z), numbers (0-9) and hyphens (-). The first and last characters cannot be hyphens. Consecutive hyphens (--) are forbidden',
  },
  emptySlugError: {
    id: 'app.containers.Admin.PagesAndMenu.components.emptySlugError',
    defaultMessage: 'Provide a slug',
  },
  takenSlugError: {
    id: 'app.containers.Admin.PagesAndMenu.components.takenSlugError',
    defaultMessage: 'This slug is already taken. Choose a different one.',
  },
  emptyTitleError: {
    id: 'app.containers.Admin.PagesAndMenu.components.emptyTitleError',
    defaultMessage: 'Provide title for all languages',
  },
  emptyDescriptionError: {
    id: 'app.containers.Admin.PagesAndMenu.components.emptyDescriptionError',
    defaultMessage: 'Provide content for all languages',
  },
  savePage: {
    id: 'app.containers.Admin.PagesAndMenu.components.savePage',
    defaultMessage: 'Save page',
  },
  savePageSuccessMessage: {
    id: 'app.containers.Admin.PagesAndMenu.components.saveSuccess',
    defaultMessage: 'Page successfully saved',
  },
});
