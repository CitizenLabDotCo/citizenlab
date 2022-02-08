import { defineMessages } from 'react-intl';

export default defineMessages({
  published: {
    id: 'app.components.ProjectFolderCards.components.Topbar.published',
    defaultMessage: 'Active',
  },
  archived: {
    id: 'app.components.ProjectFolderCards.components.Topbar.archived',
    defaultMessage: 'Archived',
  },
  draft: {
    id: 'app.components.ProjectFolderCards.components.Topbar.draft',
    defaultMessage: 'Draft',
  },
  all: {
    id: 'app.components.ProjectFolderCards.components.Topbar.all',
    defaultMessage: 'All',
  },
  a11y_publicationStatusTabs: {
    id: 'app.components.ProjectFolderCards.components.Topbar.a11y_publicationStatusTabs',
    defaultMessage: 'Tabs to switch between active and archived projects',
  },
  a11y_projectFilterTabInfo: {
    id: 'app.components.ProjectFolderCards.components.Topbar.a11y_projectFilterTabInfo',
    defaultMessage:
      '{count, plural, no {# projects} one {# project} other {# projects}}',
  },
});
