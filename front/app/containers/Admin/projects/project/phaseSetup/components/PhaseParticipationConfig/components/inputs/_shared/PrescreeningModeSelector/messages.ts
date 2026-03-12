import { defineMessages } from 'react-intl';

export default defineMessages({
  inputScreeningToggle: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.inputScreeningToggle',
    defaultMessage: 'Input screening',
  },
  contentScreeningTitle: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.contentScreeningTitle',
    defaultMessage: 'Content screening',
  },
  prescreeningModeOff: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.prescreeningModeOff',
    defaultMessage: 'Off',
  },
  prescreeningModeOffDescription: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.prescreeningModeOffDescription',
    defaultMessage: 'All inputs are published immediately without review.',
  },
  prescreeningModeFlaggedOnly: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.prescreeningModeFlaggedOnly',
    defaultMessage: 'Flagged inputs',
  },
  prescreeningModeFlaggedOnlyDescription: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.prescreeningModeFlaggedOnlyDescription',
    defaultMessage:
      'Only inputs flagged for inappropriate content require review before publication. All other inputs are published immediately. Authors can edit inputs after they are published.',
  },
  prescreeningModeAll: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.prescreeningModeAll',
    defaultMessage: 'All inputs',
  },
  prescreeningModeAllDescription: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.prescreeningModeAllDescription',
    defaultMessage:
      "All inputs require admin review before publication. Inputs will not be visible until an admin reviews and approves them. Authors can't edit inputs after they are screened or reacted on.",
  },
});
