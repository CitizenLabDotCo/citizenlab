import { defineMessages } from 'react-intl';

export default defineMessages({
  title: {
    id: 'app.components.admin.ContentBuilder.Widgets.FolderTimeline.title',
    defaultMessage: 'Folder Timeline',
  },
  defaultTitle: {
    id: 'app.components.admin.ContentBuilder.Widgets.FolderTimeline.defaultTitle',
    defaultMessage: 'Projects in this folder',
  },
  settingsDescription: {
    id: 'app.components.admin.ContentBuilder.Widgets.FolderTimeline.settingsDescription',
    defaultMessage:
      'This widget displays all published projects within this folder in a grid layout. You can customize the title below.',
  },
  statusPublished: {
    id: 'app.components.admin.ContentBuilder.Widgets.FolderTimeline.status.published',
    defaultMessage: 'Published',
  },
  statusDraft: {
    id: 'app.components.admin.ContentBuilder.Widgets.FolderTimeline.status.draft',
    defaultMessage: 'Draft',
  },
  statusArchived: {
    id: 'app.components.admin.ContentBuilder.Widgets.FolderTimeline.status.archived',
    defaultMessage: 'Archived',
  },
});
