/*
 *
 * LanguageProvider reducer
 *
 */

import { fromJS } from 'immutable';
import includes from 'lodash/includes';

import { LOAD_CURRENT_TENANT_SUCCESS } from 'utils/tenant/constants';
import {
  CHANGE_LOCALE,
} from './constants';
import {
  DEFAULT_LOCALE,
} from '../App/constants'; // eslint-disable-line

const initialState = fromJS({
  locale: (navigator && (navigator.language || navigator.userLanguage))
    || DEFAULT_LOCALE,
});

function languageProviderReducer(state = initialState, action) {
  switch (action.type) {
    case CHANGE_LOCALE:
      return state
        .set('locale', action.locale);
    case LOAD_CURRENT_TENANT_SUCCESS: {
      const setLocale = state.get('locale');
      const tenantLocales = action.payload.data.attributes.settings.core.locales;
      // If the setLocale is simply part of the tenantLocales, we're done
      if (includes(tenantLocales, setLocale)) {
        return state;
      }
      // It's not in there, but it might be similar? (e.g. 'en-US' vs 'en')
      const similarLocale = tenantLocales.find((l) => (
        l.substr(0, 2) === setLocale.substr(0, 2)
      ));
      // In the worst case, just set the first of the tenant locales
      return state.set('locale', similarLocale || tenantLocales[0]);
    }
    default:
      return state;
  }
}

export default languageProviderReducer;
