import { defineMessages } from 'react-intl';

export default defineMessages({
  urlPlaceholder: {
    id: 'app.containers.admin.ContentBuilder.urlPlaceholder',
    defaultMessage: 'https://example.com',
  },
  delete: {
    id: 'app.containers.admin.ContentBuilder.delete',
    defaultMessage: 'Delete',
  },
  a11y_closeSettingsPanel: {
    id: 'app.containers.AdminPage.ProjectDescription.a11y_closeSettingsPanel',
    defaultMessage: 'Close settings panel',
  },
  localeErrorMessage: {
    id: 'app.containers.admin.ContentBuilder.errorMessage',
    defaultMessage:
      'There is an error on { locale } content, please fix the issue to be able to save your changes',
  },
  error: {
    id: 'app.containers.admin.ContentBuilder.error',
    defaultMessage: 'error',
  },
});
