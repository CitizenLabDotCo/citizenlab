import { defineMessages } from 'react-intl';

export default defineMessages({
  approvalTitle: {
    id: 'app.containers.AdminPage.SettingsPage.approvalTitle',
    defaultMessage: 'Project approval settings',
  },
  approvalSubtitle: {
    id: 'app.containers.AdminPage.SettingsPage.approvalSubtitle',
    defaultMessage:
      'Project managers need approval to publish a project the first time it goes live. You can customise who gets the notifications.',
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
