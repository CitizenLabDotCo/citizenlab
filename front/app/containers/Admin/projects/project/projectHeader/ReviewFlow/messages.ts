import { defineMessages } from 'react-intl';

export default defineMessages({
  publish: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.projectHeader.publish',
    defaultMessage: 'Publish',
  },
  onlyAdminsAndFolderManagersCanPublish: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.projectHeader.onlyAdminsAndFolderManagersCanPublish',
    defaultMessage: 'Only admins and Folder Managers can publish projects.',
  },
  requestApprovalDescription: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.projectHeader.requestApprovalDescription1',
    defaultMessage:
      'Only admins and Folder Managers can approve projects. Click the button to ask for approval.',
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
    id: 'app.components.app.containers.AdminPage.ProjectEdit.projectHeader.pendingApprovalTooltip',
    defaultMessage:
      'Admins and Folder Managers have been notified to approve your project.',
  },
  approve: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.projectHeader.approve',
    defaultMessage: 'Approve',
  },
  approveTooltip: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.projectHeader.approveTooltip',
    defaultMessage:
      'Approving allows the Project Manager to publish the project.',
  },
});
