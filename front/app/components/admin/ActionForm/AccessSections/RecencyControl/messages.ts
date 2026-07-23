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
    id: 'app.components.admin.ActionForm.AccessSections.RecencyControl.reverifyLabel',
    defaultMessage: 'Re-verify:',
  },
  reconfirmLabel: {
    id: 'app.components.admin.ActionForm.AccessSections.RecencyControl.reconfirmLabel',
    defaultMessage: 'Re-confirm:',
  },
  inTheLast30Minutes: {
    id: 'app.components.admin.ActionForm.AccessSections.RecencyControl.inTheLast30Minutes',
    defaultMessage: 'In the last 30 minutes',
  },
  inTheLastNDays: {
    id: 'app.components.admin.ActionForm.AccessSections.RecencyControl.inTheLastNDays',
    defaultMessage: 'In the last {days, plural, one {# day} other {# days}}',
  },
  remove: {
    id: 'app.components.admin.ActionForm.AccessSections.RecencyControl.remove',
    defaultMessage: 'remove',
  },
});
