import { defineMessages } from 'react-intl';

export default defineMessages({
  editCustomPageMetaTitle: {
    id: 'app.containers.Admin.pagesAndMenu.containers.CustomPages.editCustomPageMetaTitle',
    defaultMessage: 'Meta title',
  },
  editCustomPageMetaDescription: {
    id: 'app.containers.Admin.pagesAndMenu.containers.CustomPages.editCustomPageMetaDescription',
    defaultMessage: 'Meta description',
  },
  pageSettingsTab: {
    id: 'app.containers.Admin.pagesAndMenu.containers.CustomPages.pageSettingsTab',
    defaultMessage: 'Page settings',
  },
  pageContentTab: {
    id: 'app.containers.Admin.pagesAndMenu.containers.CustomPages.pageContentTab',
    defaultMessage: 'Page content',
  },
  newCustomPagePageTitle: {
    id: 'app.containers.Admin.PagesAndMenu.containers.CreateCustomPage.newCustomPagePageTitle',
    defaultMessage: 'Create custom page',
  },
  editCustomPagePageTitle: {
    id: 'app.containers.Admin.PagesAndMenu.containers.CreateCustomPage.editCustomPagePageTitle',
    defaultMessage: 'Edit custom page',
  },
  contentEditorTitle: {
    id: 'app.containers.Admin.PagesAndMenu.containers.CreateCustomPage.contentEditorTitle',
    defaultMessage: 'Content',
  },
  saveButton: {
    id: 'app.containers.Admin.PagesAndMenu.containers.CreateCustomPage.saveButton',
    defaultMessage: 'Save custom page',
  },
  buttonSuccess: {
    id: 'app.containers.Admin.PagesAndMenu.containers.CreateCustomPage.buttonSuccess',
    defaultMessage: 'Success',
  },
  messageSuccess: {
    id: 'app.containers.Admin.PagesAndMenu.containers.CreateCustomPage.messageSuccess',
    defaultMessage: 'Custom page saved',
  },
  error: {
    id: 'app.containers.Admin.PagesAndMenu.containers.CreateCustomPage.error',
    defaultMessage: "Couldn't save custom page",
  },
  multilocError: {
    id: 'app.containers.Admin.PagesAndMenu.containers.CreateCustomPage.multilocError',
    defaultMessage: 'Please enter a title in every language',
  },
  titleLabel: {
    id: 'app.containers.Admin.PagesAndMenu.containers.CreateCustomPage.titleLabel',
    defaultMessage: 'Title',
  },
  titleTooltip: {
    id: 'app.containers.Admin.PagesAndMenu.containers.CreateCustomPage.titleTooltip',
    defaultMessage: 'Enter your title here',
  },
  slugLabel: {
    id: 'app.containers.Admin.PagesAndMenu.containers.CreateCustomPage.slugLabel',
    defaultMessage: 'URL',
  },
  slugTooltip: {
    id: 'app.containers.Admin.PagesAndMenu.containers.CreateCustomPage.slugTooltip',
    defaultMessage: 'You can set the URL for your new custom page here',
  },
  slugRegexError: {
    id: 'app.containers.Admin.PagesAndMenu.containers.CreateCustomPage.slugRegexError',
    defaultMessage:
      'The slug can only contain regular, lowercase letters (a-z), numbers (0-9) and hyphens (-). The first and last characters cannot be hyphens. Consecutive hyphens (--) are forbidden.',
  },
  slugRequiredError: {
    id: 'app.containers.Admin.PagesAndMenu.containers.CreateCustomPage.slugRequiredError',
    defaultMessage: 'You must enter a slug',
  },
  createCustomPage: {
    id: 'app.containers.Admin.PagesAndMenu.containers.CreateCustomPage.createCustomPage',
    defaultMessage: 'Create custom page',
  },
});
