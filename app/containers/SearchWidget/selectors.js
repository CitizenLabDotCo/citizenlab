/**
 * Direct selector to the search state domain
 */
import { createSelector } from 'reselect';
import { fromJS } from 'immutable';

import { selectResourcesDomain } from '../../utils/resources/selectors';
import { makeSelectSetting } from '../../utils/tenant/selectors';
import { makeSelectLocale } from '../LanguageProvider/selectors';
import { findTranslatedText } from '../T/utils';

const selectSearchDomain = () => (state) => state.get('searchWidget');

/**
 * Other specific selectors
 */

const makeSelectIsLoadingFilteredIdeas = () => createSelector(
  selectSearchDomain(),
  (searchWidgetState) => searchWidgetState.get('isLoadingFilteredIdeas')
);

const makeSelectSearchResults = () => createSelector(
  selectSearchDomain(),
  selectResourcesDomain(),
  makeSelectLocale(),
  makeSelectSetting(['core', 'locales']),
  (pageState, resources, userLocale, tenantLocales) => {
    const ids = pageState.get('searchResults', fromJS([]));
    const resourceIdeas = resources.get('ideas');
    return (resourceIdeas
      ? ids.map((id) => ({
        title: findTranslatedText(
          resourceIdeas.toJS()[id].attributes.title_multiloc,
          userLocale,
          tenantLocales
        ),
        id,
      }))
      : []);
  }
);

export {
  selectSearchDomain,
  makeSelectIsLoadingFilteredIdeas,
  makeSelectSearchResults,
};
