import { defineMessages } from 'react-intl';

export default defineMessages({
  approvalTitle: {
    id: 'app.containers.AdminPage.SettingsPage.approvalTitle',
    defaultMessage: 'Project approval settings',
  },
  approvalSubtitle: {
    id: 'app.containers.AdminPage.SettingsPage.approvalDescription',
    defaultMessage:
      'Select which admins will receive notifications to approve projects. Folder Managers are by default approvers for all projects within their folders.',
  },
  selectApprovers: {
    id: 'app.containers.AdminPage.SettingsPage.selectApprovers',
    defaultMessage: 'Select approvers',
  },
  save: {
    id: 'app.containers.AdminPage.SettingsPage.approvalSave',
    defaultMessage: 'Save',
  },
});
