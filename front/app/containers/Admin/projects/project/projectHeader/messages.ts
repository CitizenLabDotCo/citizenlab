import { defineMessages } from 'react-intl';

export default defineMessages({
  projectSettings: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.projectHeader.projectSettings',
    defaultMessage: 'Project settings',
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
    id: 'app.components.app.containers.AdminPage.ProjectEdit.projectHeader.publishedActive1',
    defaultMessage: 'Published - Active',
  },
  publishedFinished: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.projectHeader.publishedFinished1',
    defaultMessage: 'Published - Finished',
  },
  participantsInfoTitle: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.projectHeader.participantsInfo.participantsInfoTitle',
    defaultMessage: 'Participants include:',
  },
  users: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.projectHeader.participantsInfo.users',
    defaultMessage: 'Users interacting with Go Vocal methods',
  },
  attendees: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.projectHeader.participantsInfo.attendees',
    defaultMessage: 'Event attendees',
  },
  participantsExclusionTitle: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.projectHeader.participantsInfo.participantsExclusionTitle',
    defaultMessage: 'Participants do not include:',
  },
  followers: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.projectHeader.participantsInfo.followers',
    defaultMessage: 'Followers of a project',
  },
  embeddedMethods: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.projectHeader.participantsInfo.embeddedMethods',
    defaultMessage: 'Participants in embedded methods (e.g., external surveys)',
  },
  note: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.projectHeader.participantsInfo.note',
    defaultMessage:
      'Note: Enabling anonymous or open participation permissions may allow users to participate multiple times, leading to misleading or incomplete user data.',
  },
});
