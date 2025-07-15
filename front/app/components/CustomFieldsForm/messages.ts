import { defineMessages } from 'react-intl';

export default defineMessages({
  titleRequired: {
    id: 'app.components.CustomFieldsForm.titleRequired',
    defaultMessage: 'The title is required',
  },
  titleMinLength: {
    id: 'app.components.CustomFieldsForm.titleMinLength',
    defaultMessage: 'The title must be at least {min} characters long',
  },
  titleMaxLength: {
    id: 'app.components.CustomFieldsForm.titleMaxLength',
    defaultMessage: 'The title must be at most {max} characters long',
  },
  descriptionRequired: {
    id: 'app.components.CustomFieldsForm.descriptionRequired',
    defaultMessage: 'The description is required',
  },
  descriptionMinLength: {
    id: 'app.components.CustomFieldsForm.descriptionMinLength',
    defaultMessage: 'The description must be at least {min} characters long',
  },
  imageRequired: {
    id: 'app.components.CustomFieldsForm.imageRequired',
    defaultMessage: 'The image is required',
  },
  fileRequired: {
    id: 'app.components.CustomFieldsForm.attachmentRequired',
    defaultMessage: 'At least one attachment is required',
  },
  topicRequired: {
    id: 'app.components.CustomFieldsForm.topicRequired',
    defaultMessage: 'At least one tag is required',
  },
  fieldRequired: {
    id: 'app.components.CustomFieldsForm.fieldRequired',
    defaultMessage: 'The field "{fieldName}" is required',
  },
  fieldMaximum: {
    id: 'app.components.CustomFieldsForm.fieldMaximumItems',
    defaultMessage:
      'At most {maxSelections, plural, one {# option} other {# options}} can be selected for the field "{fieldName}"',
  },
  fieldMinimum: {
    id: 'app.components.CustomFieldsForm.fieldMinimumItems',
    defaultMessage:
      'At least {minSelections, plural, one {# option} other {# options}} can be selected for the field "{fieldName}"',
  },
  progressBarLabel: {
    id: 'app.components.CustomFieldsForm.progressBarLabel',
    defaultMessage: 'Progress',
  },
  selectMany: {
    id: 'app.components.CustomFieldsForm.selectMany',
    defaultMessage: '*Choose as many as you like',
  },
  adminFieldTooltip: {
    id: 'app.components.CustomFieldsForm.adminFieldTooltip',
    defaultMessage: 'Field only visible to admins',
  },
  notPublic: {
    id: 'app.components.CustomFieldsForm.notPublic1',
    defaultMessage:
      '*This answer will only be shared with project managers, and not to the public.',
  },
  selectBetween: {
    id: 'app.components.CustomFieldsForm.selectBetween',
    defaultMessage: '*Select between { minItems } and { maxItems } options',
  },
  selectExactly: {
    id: 'app.components.CustomFieldsForm.selectExactly2',
    defaultMessage:
      '*Select exactly {selectExactly, plural, one {# option} other {# options}}',
  },
  selectAsManyAsYouLike: {
    id: 'app.components.CustomFieldsForm.selectAsManyAsYouLike',
    defaultMessage: '*Select as many as you like',
  },
  validCordinatesTooltip: {
    id: 'app.components.CustomFieldsForm.validCordinatesTooltip2',
    defaultMessage:
      "If the location is not displayed among the options as you type, you can add valid coordinates in the format 'latitude, longitude' to specify a precise location (eg: -33.019808, -71.495676).",
  },
  typeYourAnswer: {
    id: 'app.components.CustomFieldsForm.typeYourAnswer',
    defaultMessage: 'Type your answer',
  },
  typeYourAnswerRequired: {
    id: 'app.components.CustomFieldsForm.typeYourAnswerRequired',
    defaultMessage: 'It is required to type your answer',
  },
  authorFieldPlaceholder: {
    id: 'app.components.CustomFieldsForm.authorFieldPlaceholder',
    defaultMessage: 'Start typing to search by user email or name...',
  },
  authorFieldLabel: {
    id: 'app.components.CustomFieldsForm.authorFieldLabel',
    defaultMessage: 'Author',
  },
  budgetFieldLabel: {
    id: 'app.components.CustomFieldsForm.budgetFieldLabel',
    defaultMessage: 'Budget',
  },
  uploadShapefileInstructions: {
    id: 'app.components.CustomFieldsForm.uploadShapefileInstructions',
    defaultMessage: '* Upload a zip file containing one or more shapefiles.',
  },
  tapOnMapToAddOrType: {
    id: 'app.components.CustomFieldsForm.tapOnMapToAddOrType',
    defaultMessage:
      'Tap on the map or type an address below to add your answer.',
  },
  tapOnMapMultipleToAdd: {
    id: 'app.components.CustomFieldsForm.tapOnMapMultipleToAdd3',
    defaultMessage: 'Tap on the map to add your answer.',
  },
  tapOnFullscreenMapToAddPoint: {
    id: 'app.components.CustomFieldsForm.tapOnFullscreenMapToAddPoint',
    defaultMessage: 'Tap on the map to draw.',
  },
  tapOnFullscreenMapToAdd: {
    id: 'app.components.CustomFieldsForm.tapOnFullscreenMapToAdd4',
    defaultMessage:
      'Tap on the map to draw. Then, drag on points to move them.',
  },
  clickOnMapToAddOrType: {
    id: 'app.components.CustomFieldsForm.clickOnMapToAddOrType',
    defaultMessage:
      'Click on the map or type an address below to add your answer.',
  },
  clickOnMapMultipleToAdd: {
    id: 'app.components.CustomFieldsForm.clickOnMapMultipleToAdd3',
    defaultMessage:
      'Click on the map to draw. Then, drag on points to move them.',
  },
  minimumCoordinates: {
    id: 'app.components.CustomFieldsForm.minimumCoordinates2',
    defaultMessage: 'A minimum of {numPoints} map points is required.',
  },
  addressInputAriaLabel: {
    id: 'app.components.CustomFieldsForm.addressInputAriaLabel',
    defaultMessage: 'Address input',
  },
  addressInputPlaceholder: {
    id: 'app.components.CustomFieldsForm.addressInputPlaceholder6',
    defaultMessage: 'Enter an address...',
  },
  tapToAddAPoint: {
    id: 'app.components.CustomFieldsForm.tapToAddAPoint',
    defaultMessage: 'Tap to add a point',
  },
  tapToAddALine: {
    id: 'app.components.CustomFieldsForm.tapToAddALine',
    defaultMessage: 'Tap to add a line',
  },
  tapToAddAnArea: {
    id: 'app.components.CustomFieldsForm.tapToAddAnArea',
    defaultMessage: 'Tap to add an area',
  },
  back: {
    id: 'app.components.CustomFieldsForm.back',
    defaultMessage: 'Back',
  },
  confirm: {
    id: 'app.components.CustomFieldsForm.confirm',
    defaultMessage: 'Confirm',
  },
  removeAnswer: {
    id: 'app.components.CustomFieldsForm.removeAnswer',
    defaultMessage: 'Remove answer',
  },
  atLeastTwoPointsRequired: {
    id: 'app.components.CustomFieldsForm.atLeastTwoPointsRequired',
    defaultMessage: 'At least two points are required for a line.',
  },
  atLeastThreePointsRequired: {
    id: 'app.components.CustomFieldsForm.atLeastThreePointsRequired',
    defaultMessage: 'At least three points are required for a polygon.',
  },
  anonymousSurveyMessage: {
    id: 'app.components.CustomFieldsForm.anonymousSurveyMessage2',
    defaultMessage: 'All responses to this survey are anonymized.',
  },
  fileSizeLimit: {
    id: 'app.components.CustomFieldsForm.fileSizeLimit',
    defaultMessage: 'The file size limit is {maxFileSize} MB.',
  },
  otherArea: {
    id: 'app.components.CustomFieldsForm.otherArea',
    defaultMessage: 'Somewhere else',
  },
});
