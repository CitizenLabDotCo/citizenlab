import { fromJS } from 'immutable';

import { LOAD_CURRENT_TENANT_SUCCESS } from 'utils/tenant/constants';
import languageProviderReducer from '../reducer';
import {
  CHANGE_LOCALE,
} from '../constants';

describe('languageProviderReducer', () => {
  it('returns the initial state', () => {
    expect(languageProviderReducer(undefined, {})).toEqual(fromJS({
      locale: 'en-US',
    }));
  });

  it('changes the locale', () => {
    expect(languageProviderReducer(undefined, { type: CHANGE_LOCALE, locale: 'de' }).toJS()).toEqual({
      locale: 'de',
    });
  });

  const fakeLoadTenantSuccessAction = {
    type: LOAD_CURRENT_TENANT_SUCCESS,
    payload: {
      data: {
        attributes: {
          settings: {
            core: {
              locales: ['en', 'nl', 'fr-LU'],
            },
          },
        },
      },
    },
  };

  it('takes the first locale from the tenant when set locale is not supported', () => {
    const state = fromJS({ locale: 'na' });
    expect(languageProviderReducer(state, fakeLoadTenantSuccessAction)).toEqual(fromJS({
      locale: 'en',
    }));
  });

  it('keeps the set locale when it\'s supported by tenant', () => {
    const state = fromJS({ locale: 'nl' });
    expect(languageProviderReducer(state, fakeLoadTenantSuccessAction)).toEqual(fromJS({
      locale: 'nl',
    }));
  });

  it('takes a more generic locale that\'s supported by the tenant', () => {
    const state = fromJS({ locale: 'nl-BE' });
    expect(languageProviderReducer(state, fakeLoadTenantSuccessAction)).toEqual(fromJS({
      locale: 'nl',
    }));
  });

  it('takes a more specialized locale that\'s supported by the tenant', () => {
    const state = fromJS({ locale: 'fr' });
    expect(languageProviderReducer(state, fakeLoadTenantSuccessAction)).toEqual(fromJS({
      locale: 'fr-LU',
    }));
  });
});
