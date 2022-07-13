import { defineMessages } from 'react-intl';

export default defineMessages({
  tabNavigation: {
    id: 'app.modules.navbar.admin.components.tabNavigation',
    defaultMessage: 'Navigation',
  },
  policiesSubtitlePremium: {
    id: 'app.containers.AdminPage.PagesEdition.policiesSubtitlePremium1',
    defaultMessage:
      "Edit your platform's terms and conditions and privacy policy. Other pages, including the About and FAQ pages, can be edited in the {navigationLink} tab.",
  },
  linkToNavigation: {
    id: 'app.containers.AdminPage.PagesEdition.linkToNavigation',
    defaultMessage: 'Navigation',
  },
  navbarItemTitle: {
    id: 'app.modules.commercial.customizable_navbar.admin.components.NavbarTitleField.navbarItemTitle',
    defaultMessage: 'Name in navbar',
  },
  emptyNavbarItemTitleError: {
    id: 'app.modules.commercial.customizable_navbar.admin.components.NavbarTitleField.emptyNavbarItemTitleError',
    defaultMessage:
      "The 'Name in navbar' field is required. If your platform has multiple languages, check that all languages are filled in.",
  },
  pageTitle: {
    id: 'app.modules.commercial.customizable_navbar.pageTitle',
    defaultMessage: 'Title',
  },
  pageUrl: {
    id: 'app.modules.commercial.customizable_navbar.pageUrl',
    defaultMessage: 'Page URL',
  },
  editContent: {
    id: 'app.modules.commercial.customizable_navbar.editContent',
    defaultMessage: 'Content',
  },
  fileUploadLabel: {
    id: 'app.modules.commercial.customizable_navbar.fileUploadLabel',
    defaultMessage: 'Add files to this page',
  },
  fileUploadLabelTooltip: {
    id: 'app.modules.commercial.customizable_navbar.fileUploadLabelTooltip',
    defaultMessage:
      'Files should not be larger than 50Mb. Added files will be shown on the bottom of this page.',
  },
  slugLabelTooltip: {
    id: 'app.modules.commercial.customizable_navbar.slugLabelTooltip',
    defaultMessage:
      "You can specify the last part of your page's URL (called the slug). For example, the current page's URL is {currentPageURL}, where {currentPageSlug} is the slug.",
  },
  resultingPageURL: {
    id: 'app.modules.commercial.customizable_navbar.resultingPageURL',
    defaultMessage: 'Resulting URL',
  },
  brokenURLWarning: {
    id: 'app.modules.commercial.customizable_navbar.brokenURLWarning',
    defaultMessage:
      'If you change the URL, links to this page using the old URL will no longer work.',
  },
  slugRegexError: {
    id: 'app.modules.commercial.customizable_navbar.slugRegexError',
    defaultMessage:
      'The slug can only contain regular, lowercase letters (a-z), numbers (0-9) and hyphens (-). The first and last characters cannot be hyphens. Consecutive hyphens (--) are forbidden.',
  },
  emptySlugError: {
    id: 'app.modules.commercial.customizable_navbar.emptySlugError',
    defaultMessage: "The slug can't be empty.",
  },
  takenSlugError: {
    id: 'app.components.pageForm.takenSlugError',
    defaultMessage:
      'This slug is already taken. Please choose a different one.',
  },
  emptyTitleError: {
    id: 'app.modules.commercial.customizable_navbar.emptyTitleError',
    defaultMessage:
      'The title field is required. If your platform has multiple languages, check that all languages are filled in.',
  },
  emptyDescriptionError: {
    id: 'app.modules.commercial.customizable_navbar.emptyDescriptionError',
    defaultMessage:
      'The description field is required. If your platform has multiple languages, check that all languages are filled in.',
  },
  save: {
    id: 'app.modules.commercial.customizable_navbar.admin.components.NavbarTitleField.save',
    defaultMessage: 'Save',
  },
});
