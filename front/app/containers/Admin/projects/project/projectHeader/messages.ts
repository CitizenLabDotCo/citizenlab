import { defineMessages } from 'react-intl';

export default defineMessages({
  settings: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.projectHeader.settings',
    defaultMessage: 'Settings',
  },
  view: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.projectHeader.view',
    defaultMessage: 'View',
  },
  participants: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.projectHeader.participants',
    defaultMessage:
      '{participantsCount, plural, one {1 participant} other {{participantsCount} participants}}',
  },
  everyone: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.projectHeader.everyone',
    defaultMessage: 'Everyone',
  },
  adminsOnly: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.projectHeader.adminsOnly',
    defaultMessage: 'Admins only',
  },
  groups: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.projectHeader.groups',
    defaultMessage: 'Groups',
  },
  draft: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.projectHeader.draft',
    defaultMessage: 'Draft',
  },
  archived: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.projectHeader.archived',
    defaultMessage: 'Archived',
  },
  publishedActive: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.projectHeader.publishedActive',
    defaultMessage: 'Published: Active',
  },
  publishedFinished: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.projectHeader.publishedFinished',
    defaultMessage: 'Published: Finished',
  },
});
