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
    id: 'app.components.CustomFieldsForm.fileRequired',
    defaultMessage: 'At least one file is required',
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
});
