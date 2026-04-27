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
    id: 'app.components.app.containers.AdminPage.ProjectEdit.projectHeader.changeProjectStatus',
    defaultMessage: 'Change project status',
  },
  close: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.projectHeader.close',
    defaultMessage: 'Close',
  },
  saveChanges: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.projectHeader.saveChanges',
    defaultMessage: 'Save changes',
  },
  changeStatusPublishedTitle: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.projectHeader.changeStatusPublishedTitle',
    defaultMessage: 'Published',
  },
  changeStatusPublishedBullet1: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.projectHeader.changeStatusPublishedBullet1',
    defaultMessage:
      'Makes the project publicly visible to selected groups (unless unlisted).',
  },
  changeStatusDraftTitle: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.projectHeader.changeStatusDraftTitle',
    defaultMessage: 'Move to Draft',
  },
  changeStatusDraftBullet1: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.projectHeader.changeStatusDraftBullet1',
    defaultMessage:
      'Hides this project from all users except admins & assigned project managers.',
  },
  changeStatusDraftBullet2: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.projectHeader.changeStatusDraftBullet2',
    defaultMessage: 'The public URL will only work via the Share preview link.',
  },
  changeStatusArchivedTitle: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.projectHeader.changeStatusArchivedTitle',
    defaultMessage: 'Archive project',
  },
  changeStatusArchivedBullet1: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.projectHeader.changeStatusArchivedBullet1',
    defaultMessage:
      'Closes participation while keeping the project visible and accessible via URL.',
  },
  changeStatusArchivedBullet2: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.projectHeader.changeStatusArchivedBullet2',
    defaultMessage: 'Hides the project from general project search.',
  },
  changeStatusArchivedBullet3: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.projectHeader.changeStatusArchivedBullet3',
    defaultMessage: 'It can still appear in dedicated homepage modules.',
  },
});
