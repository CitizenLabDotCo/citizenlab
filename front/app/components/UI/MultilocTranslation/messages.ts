import { defineMessages } from 'react-intl';

export default defineMessages({
  translateFrom: {
    id: 'app.components.UI.MultilocTranslation.translateFrom',
    defaultMessage: 'Translate from {language}',
  },
  translateToAllEmptyLanguages: {
    id: 'app.components.UI.MultilocTranslation.translateToAllEmptyLanguages',
    defaultMessage: 'Translate to all empty languages',
  },
  machineTranslationHint: {
    id: 'app.components.UI.MultilocTranslation.machineTranslationHint',
    defaultMessage: 'Machine translation. Check and edit if needed.',
  },
  translationFailed: {
    id: 'app.components.UI.MultilocTranslation.translationFailed',
    defaultMessage: 'The translation failed. Try again later.',
  },
});
