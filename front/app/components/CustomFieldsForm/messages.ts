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
});
