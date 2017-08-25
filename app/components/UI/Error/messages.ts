import { defineMessages } from 'react-intl';

export default defineMessages({
  blank: {
    id: 'app.errors.generics.blank',
    defaultMessage: 'This field cannot be empty.'
  },
  invalid: {
    id: 'app.errors.generics.invalid',
    defaultMessage: 'This field contains an invalid value.'
  },
  unsupported_locales: {
    id: 'app.errors.generics.unsupported_locales',
    defaultMessage: 'This field does not support the current locale.'
  },
  title_multiloc_blank: {
    id: 'app.errors.title_multiloc_blank',
    defaultMessage: 'The title cannot be empty.'
  },
});
