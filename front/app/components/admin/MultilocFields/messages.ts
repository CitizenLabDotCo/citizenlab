import { defineMessages } from 'react-intl';

export default defineMessages({
  formatting: {
    id: 'app.components.admin.MultilocFields.formatting',
    defaultMessage: 'Formatting',
  },
  missingLanguages: {
    id: 'app.components.admin.MultilocFields.missingLanguages',
    defaultMessage:
      'Add the {fields} in {language}{others, plural, =0 {} one { and # more language} other { and # more languages}}',
  },
  title: {
    id: 'app.components.admin.MultilocFields.fieldTitle',
    defaultMessage: 'title',
  },
  description: {
    id: 'app.components.admin.MultilocFields.fieldDescription',
    defaultMessage: 'description',
  },
  altText: {
    id: 'app.components.admin.MultilocFields.fieldAltText',
    defaultMessage: 'alt text',
  },
});
