import { defineMessages } from 'react-intl';

export default defineMessages({
  publish: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.projectHeader.publish',
    defaultMessage: 'Publish',
  },
  approve: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.projectHeader.approve',
    defaultMessage: 'Approve',
  },
  approveTooltip: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.projectHeader.approveTooltip2',
    defaultMessage: 'Approving allows Project Managers to publish the project.',
  },
  requestApproval: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.projectHeader.requestApproval',
    defaultMessage: 'Request approval',
  },
  requestApprovalDescription: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.projectHeader.requestApprovalDescription2',
    defaultMessage:
      'The project must be approved by an admin{inFolder, select, true { or one of the Folder Managers} other {}} before you can publish it. Click the button below to request approval.',
  },
  pendingApproval: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.projectHeader.pendingApproval',
    defaultMessage: 'Waiting for approval',
  },
  pendingApprovalTooltip: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.projectHeader.pendingApprovalTooltip2',
    defaultMessage: 'Project reviewers have been notified.',
  },
  scheduled: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.projectHeader.scheduled',
    defaultMessage: 'Scheduled',
  },
  published: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.projectHeader.publishedEntryButton',
    defaultMessage: 'Published',
  },
  archived: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.projectHeader.archivedEntryButton',
    defaultMessage: 'Archived',
  },
  changeProjectStatus: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.projectHeader.changeProjectStatus2',
    defaultMessage: 'Project status',
  },
  close: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.projectHeader.close',
    defaultMessage: 'Close',
  },
  saveChanges: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.projectHeader.saveChanges2',
    defaultMessage: 'Save',
  },
  changeStatusPublishedTitle: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.projectHeader.changeStatusPublishedTitle',
    defaultMessage: 'Published',
  },
  changeStatusPublishedBullet1: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.projectHeader.changeStatusPublishedBullet12',
    defaultMessage:
      'Accessible to all users or to specific groups, depending on the project settings',
  },
  changeStatusPublishedBullet2: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.projectHeader.changeStatusPublishedBullet2',
    defaultMessage:
      'Shown in the project list and in search, unless set to unlisted',
  },
  changeStatusDraftTitle: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.projectHeader.changeStatusDraftTitle2',
    defaultMessage: 'Draft',
  },
  changeStatusDraftBullet1: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.projectHeader.changeStatusDraftBullet1',
    defaultMessage:
      'Accessible only to admins and assigned managers (space, folder, or project)',
  },
  changeStatusDraftBullet2: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.projectHeader.changeStatusDraftBullet22',
    defaultMessage: 'Anyone with the Share preview link can also access it',
  },
  changeStatusArchivedTitle: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.projectHeader.changeStatusArchivedTitle2',
    defaultMessage: 'Archived',
  },
  changeStatusArchivedBullet1: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.projectHeader.changeStatusArchivedBullet12',
    defaultMessage:
      'Participation is closed, but the project stays accessible via its URL',
  },
  changeStatusArchivedBullet2: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.projectHeader.changeStatusArchivedBullet22',
    defaultMessage: 'Hidden from the general project search',
  },
  changeStatusArchivedBullet3: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.projectHeader.changeStatusArchivedBullet32',
    defaultMessage: 'Visible only in dedicated homepage modules',
  },
});
