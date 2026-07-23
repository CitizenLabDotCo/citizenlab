import { defineMessages } from 'react-intl';

export default defineMessages({
  howRecentlyVerified: {
    id: 'app.components.admin.ActionForm.AccessSections.RecencyControl.howRecentlyVerified',
    defaultMessage: 'How recently should users be verified?',
  },
  howRecentlyConfirmed: {
    id: 'app.components.admin.ActionForm.AccessSections.RecencyControl.howRecentlyConfirmed',
    defaultMessage: 'How recently should users be confirmed?',
  },
  inTheLast30Minutes: {
    id: 'app.components.admin.ActionForm.AccessSections.RecencyControl.inTheLast30Minutes',
    defaultMessage: 'In the last 30 minutes',
  },
  inTheLastNDays: {
    id: 'app.components.admin.ActionForm.AccessSections.RecencyControl.inTheLastNDays',
    defaultMessage: 'In the last {days, plural, one {# day} other {# days}}',
  },
  onceIsEnough: {
    id: 'app.components.admin.ActionForm.AccessSections.RecencyControl.onceIsEnough',
    defaultMessage: 'Once is enough',
  },
});
