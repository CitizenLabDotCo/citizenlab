import { defineMessages } from 'react-intl';

export default defineMessages({
  published: {
    id: 'app.components.ProjectFolderCards.components.Header.published',
    defaultMessage: 'Active',
  },
  archived: {
    id: 'app.components.ProjectFolderCards.components.Header.archived',
    defaultMessage: 'Archived',
  },
  draft: {
    id: 'app.components.ProjectFolderCards.components.Header.draft',
    defaultMessage: 'Draft',
  },
  all: {
    id: 'app.components.ProjectFolderCards.components.Header.all',
    defaultMessage: 'All',
  },
  a11y_publicationStatusTabs: {
    id: 'app.components.ProjectFolderCards.components.Header.a11y_publicationStatusTabs',
    defaultMessage: 'Tabs to switch between active and archived projects',
  },
  a11y_tab: {
    id: 'app.components.ProjectFolderCards.components.Header.a11y_tab',
    defaultMessage: 'Tab {tab}: {count} projects',
  },
});
