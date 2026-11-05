import { defineMessages } from 'react-intl';

export default defineMessages({
  noTextYet: {
    id: 'app.components.UI.MultilocTranslation.noTextYet',
    defaultMessage: 'No {language} text yet.',
  },
  translateFrom: {
    id: 'app.components.UI.MultilocTranslation.translateFrom',
    defaultMessage: 'Translate from {language}',
  },
  translateTo: {
    id: 'app.components.UI.MultilocTranslation.translateTo',
    defaultMessage: 'Translate to {language}',
  },
  translateAllEmpty: {
    id: 'app.components.UI.MultilocTranslation.translateAllEmpty',
    defaultMessage: 'Translate all empty languages ({count})',
  },
  machineTranslationFrom: {
    id: 'app.components.UI.MultilocTranslation.machineTranslationFrom',
    defaultMessage: 'Machine translation from {language}. Please review.',
  },
  sourceChanged: {
    id: 'app.components.UI.MultilocTranslation.sourceChanged',
    defaultMessage: 'The {language} text changed since this translation.',
  },
  translateAgain: {
    id: 'app.components.UI.MultilocTranslation.translateAgain',
    defaultMessage: 'Translate again',
  },
  updateOutdated: {
    id: 'app.components.UI.MultilocTranslation.updateOutdated',
    defaultMessage: 'Update outdated translations ({count})',
  },
  translating: {
    id: 'app.components.UI.MultilocTranslation.translating',
    defaultMessage: 'Translating…',
  },
  translationFailed: {
    id: 'app.components.UI.MultilocTranslation.translationFailed',
    defaultMessage: 'The translation failed. Try again later.',
  },
  machineTranslationState: {
    id: 'app.components.UI.MultilocTranslation.machineTranslationState',
    defaultMessage: 'machine translation',
  },
  staleTranslationState: {
    id: 'app.components.UI.MultilocTranslation.staleTranslationState',
    defaultMessage: 'outdated machine translation',
  },
});
