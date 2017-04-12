import { createSelector } from 'reselect';
import { makeSelectCurrentUser } from 'utils/auth/selectors';
/**
 * Direct selector to the languageToggle state domain
 */
const selectLanguage = (state) => state.get('language');

/**
 * Select the language locale
 */

const makeSelectLocale = () => createSelector(
  selectLanguage,
  makeSelectCurrentUser(),
  (languageState, currentUser) => {
    if (currentUser) {
      return currentUser.attributes.locale;
    }
    return languageState.get('locale');
  }
);

export {
  selectLanguage,
  makeSelectLocale,
};
