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
    id: 'app.components.form.controls.notPublic1',
    defaultMessage:
      '*This answer will only be shared with project managers, and not to the public.',
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
    id: 'app.components.form.controls.validCordinatesTooltip2',
    defaultMessage:
      "If the location is not displayed among the options as you type, you can add valid coordinates in the format 'latitude, longitude' to specify a precise location (eg: -33.019808, -71.495676).",
  },
  tapOnMapToAddOrType: {
    id: 'app.components.form.controls.tapOnMapToAddOrType',
    defaultMessage:
      'Tap on the map or type an address below to add your answer.',
  },
  tapOnMapMultipleToAdd: {
    id: 'app.components.form.controls.tapOnMapMultipleToAdd2',
    defaultMessage: 'Tap on the map to add your answer.',
  },
  tapOnFullscreenMapToAdd: {
    id: 'app.components.form.controls.tapOnFullscreenMapToAdd3',
    defaultMessage: 'Tap on the map to draw.',
  },
  clickOnMapToAddOrType: {
    id: 'app.components.form.controls.clickOnMapToAddOrType',
    defaultMessage:
      'Click on the map or type an address below to add your answer.',
  },
  clickOnMapMultipleToAdd: {
    id: 'app.components.form.controls.clickOnMapMultipleToAdd',
    defaultMessage: 'Click on the map multiple times to add your answer.',
  },
  addressInputAriaLabel: {
    id: 'app.components.form.controls.addressInputAriaLabel',
    defaultMessage: 'Address input',
  },
  addressInputPlaceholder: {
    id: 'app.components.form.controls.addressInputPlaceholder6',
    defaultMessage: 'Enter an address...',
  },
  tapToAddAPoint: {
    id: 'app.components.form.controls.tapToAddAPoint',
    defaultMessage: 'Tap to add a point',
  },
  tapToAddALine: {
    id: 'app.components.form.controls.tapToAddALine',
    defaultMessage: 'Tap to add a line',
  },
  tapToAddAnArea: {
    id: 'app.components.form.controls.tapToAddAnArea',
    defaultMessage: 'Tap to add an area',
  },
  back: {
    id: 'app.components.form.controls.back',
    defaultMessage: 'Back',
  },
  confirm: {
    id: 'app.components.form.controls.confirm',
    defaultMessage: 'Confirm',
  },
  minimumCoordinates: {
    id: 'app.components.form.controls.minimumCoordinates2',
    defaultMessage: 'A minimum of {numPoints} map points is required.',
  },
});
