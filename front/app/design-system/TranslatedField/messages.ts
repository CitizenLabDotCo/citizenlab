import { defineMessages } from 'react-intl';

export default defineMessages({
  languagesCount: {
    id: 'app.designSystem.TranslatedField.languagesCount',
    defaultMessage: '{done} of {total} languages',
  },
  // Kept from the former language switcher, so its translations stay.
  toTranslate: {
    id: 'app.designSystem.LanguageSwitcher.toTranslate',
    defaultMessage: '{language}, to translate',
  },
});
