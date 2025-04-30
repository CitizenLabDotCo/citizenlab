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
});
