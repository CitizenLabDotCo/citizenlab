import { defineMessages } from 'react-intl';

export default defineMessages({
  anyone: {
    id: 'front.app.components.admin.ActionForm.AccessSections.AccessSection.anyone',
    defaultMessage: 'Anyone',
  },
  noAccountNeeded: {
    id: 'front.app.components.admin.ActionForm.AccessSections.AccessSection.noAccountNeeded',
    defaultMessage: 'No account needed',
  },
  adminManagersOnly: {
    id: 'front.app.components.admin.ActionForm.AccessSections.AccessSection.adminManagersOnly',
    defaultMessage: 'Admin & managers only',
  },
  restrictedToStaff: {
    id: 'front.app.components.admin.ActionForm.AccessSections.AccessSection.restrictedToStaff2',
    defaultMessage:
      'Restricted to admins and whoever has management rights this project. No other requirements apply.',
  },
  onlyAdminsAndManagers: {
    id: 'front.app.components.admin.ActionForm.AccessSections.AccessSection.onlyAdminsAndManagers',
    defaultMessage:
      'Only admins and managers can take this action. No other requirements apply.',
  },
});
