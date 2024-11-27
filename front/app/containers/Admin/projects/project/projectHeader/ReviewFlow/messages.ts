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
    id: 'app.components.app.containers.AdminPage.ProjectEdit.projectHeader.requestApprovalDescription',
    defaultMessage:
      'Only admins and Folder Managers can publish projects. Click the button to ask for approval.',
  },
  requestApproval: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.projectHeader.requestApproval',
    defaultMessage: 'Request approval',
  },
});
