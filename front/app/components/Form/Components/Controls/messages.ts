import { defineMessages } from 'react-intl';

export default defineMessages({
  selectMany: {
    id: 'app.components.form.controls.selectMany',
    defaultMessage: '*Choose as many as you like',
  },
  adminFieldTooltip: {
    id: 'app.components.form.controls.adminFieldTooltip',
    defaultMessage: 'Field only visible to admins',
  },
  notPublic: {
    id: 'app.components.form.controls.notPublic',
    defaultMessage:
      '*This answer will only be shared with moderators, and not to the public.',
  },
  selectBetween: {
    id: 'app.components.form.controls.selectBetween',
    defaultMessage: '*Select between { minItems } and { maxItems } options',
  },
  selectExactly: {
    id: 'app.components.form.controls.selectExactly',
    defaultMessage:
      '*Please select exactly {selectExactly, plural, one {# option} other {# options}}',
  },
});
