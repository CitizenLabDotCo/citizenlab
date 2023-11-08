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
    id: 'app.components.form.controls.selectExactly2',
    defaultMessage:
      '*Select exactly {selectExactly, plural, one {# option} other {# options}}',
  },
  selectAsManyAsYouLike: {
    id: 'app.components.form.controls.selectAsManyAsYouLike',
    defaultMessage: '*Select as many as you like',
  },
  validCordinatesTooltip: {
    id: 'app.components.form.controls.validCordinatesTooltip',
    defaultMessage:
      "If the location is not displayed among the options as you type, you can add valid coordinates in the format 'latitude, longitude' to specify a precise location.",
  },
});
