import { addLocaleData } from 'react-intl';
import klLocaleData from 'react-intl/locale-data/kl';

import { formatTranslationMessages } from './';

addLocaleData(klLocaleData);

const klGLTranslationMessages = require('translations/kl-GL.json');
const translationMessages = formatTranslationMessages(
  'kl-GL',
  klGLTranslationMessages
);

export default translationMessages;
