import { defineMessages } from 'react-intl';

export default defineMessages({
  pageTitle: {
    id: 'app.containers.Admin.PagesAndMenu.containers.CreateCustomPage.pageTitle',
    defaultMessage: 'New custom page',
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
    defaultMessage: 'You must enter a slug'

  },
  resultingURL: {
    id: 'app.containers.Admin.PagesAndMenu.containers.CreateCustomPage.resultingUrl',
    defaultMessage: 'Resulting URL',
  },
});
