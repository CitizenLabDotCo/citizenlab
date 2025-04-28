import { defineMessages } from 'react-intl';

export default defineMessages({
  publish: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.projectHeader.publish',
    defaultMessage: 'Publish',
  },
  onlyAdminsAndFolderManagersCanPublish: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.projectHeader.onlyAdminsAndFolderManagersCanPublish2',
    defaultMessage:
      'Only admins{inFolder, select, true { or the Folder Managers} other {}} can publish the project',
  },
  requestApprovalDescription: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.projectHeader.requestApprovalDescription2',
    defaultMessage:
      'The project must be approved by an admin{inFolder, select, true { or one of the Folder Managers} other {}} before you can publish it. Click the button below to request approval.',
  },
  requestApproval: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.projectHeader.requestApproval',
    defaultMessage: 'Request approval',
  },
  pendingApproval: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.projectHeader.pendingApproval',
    defaultMessage: 'Waiting for approval',
  },
  pendingApprovalTooltip: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.projectHeader.pendingApprovalTooltip2',
    defaultMessage: 'Project reviewers have been notified.',
  },
  approve: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.projectHeader.approve',
    defaultMessage: 'Approve',
  },
  approveTooltip: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.projectHeader.approveTooltip2',
    defaultMessage: 'Approving allows Project Managers to publish the project.',
  },
});
