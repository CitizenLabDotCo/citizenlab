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
    id: 'app.components.CustomFieldsForm.fieldMaximum',
    defaultMessage:
      'At most {maxSelections} options can be selected for the field "{fieldName}"',
  },
  fieldMinimum: {
    id: 'app.components.CustomFieldsForm.fieldMinimum',
    defaultMessage:
      'At least {minSelections} options can be selected for the field "{fieldName}"',
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
});
