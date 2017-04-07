/*
 * LocaleChanger Messages
 *
 * This contains all the text for the LocaleChanger component.
 */
import { defineMessages } from 'react-intl';

export default defineMessages({
  header: {
    id: 'app.components.LocaleChanger.header',
    defaultMessage: 'Language:',
  },
  appReload: {
    id: 'app.components.LocaleChanger.appReload',
    defaultMessage: '(Not stored in profile and will reset the data!)',
  },
});
