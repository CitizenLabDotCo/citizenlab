import { defineMessages } from 'react-intl';

export default defineMessages({
  requireRecentVerification: {
    id: 'app.components.admin.ActionForm.AccessSections.RecencyControl.requireRecentVerification',
    defaultMessage: '+ Require recent verification',
  },
  requireRecentConfirmation: {
    id: 'app.components.admin.ActionForm.AccessSections.RecencyControl.requireRecentConfirmation',
    defaultMessage: '+ Require recent confirmation',
  },
  reverifyLabel: {
    id: 'app.components.admin.ActionForm.AccessSections.RecencyControl.reverifyLabel2',
    defaultMessage: 'Re-verify if last verification is older than:',
  },
  reconfirmLabel: {
    id: 'app.components.admin.ActionForm.AccessSections.RecencyControl.reconfirmLabel2',
    defaultMessage: 'Re-confirm if last confirmation is older than:',
  },
  thirtyMinutes: {
    id: 'app.components.admin.ActionForm.AccessSections.RecencyControl.thirtyMinutes',
    defaultMessage: '30 minutes',
  },
  nDays: {
    id: 'app.components.admin.ActionForm.AccessSections.RecencyControl.nDays',
    defaultMessage: '{days, plural, one {# day} other {# days}}',
  },
  remove: {
    id: 'app.components.admin.ActionForm.AccessSections.RecencyControl.remove',
    defaultMessage: 'remove',
  },
});
