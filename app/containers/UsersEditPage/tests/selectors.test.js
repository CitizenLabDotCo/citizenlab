import { fromJS } from 'immutable';
import { makeSelectUserData, makeSelectLoadError, makeSelectLoading, makeSelectStoreError } from '../selectors';

describe('makeSelectUsersEditPageDomain', () => {
  describe('makeSelectLoading', () => {
    const loadingSelector = makeSelectLoading();
    it('should select the loading', () => {
      const loading = false;
      const mockedState = fromJS({
        profile: {
          loading,
        },
      });
      expect(loadingSelector(mockedState)).toEqual(loading);
    });
  });

  const loadErrorSelector = makeSelectLoadError();
  it('should select the loading error', () => {
    const loadError = true;
    const mockedState = fromJS({
      profile: {
        loadError,
      },
    });
    expect(loadErrorSelector(mockedState)).toEqual(loadError);
  });

  const storeErrorSelector = makeSelectStoreError();
  it('should select the store error', () => {
    const storeError = true;
    const mockedState = fromJS({
      profile: {
        storeError,
      },
    });
    expect(storeErrorSelector(mockedState)).toEqual(storeError);
  });

  const userDataSelector = makeSelectUserData();
  const user = {
    firstName: 'X',
    lastName: 'Y',
    gender: 'Male',
    email: 'a@b.cd',
  };
  it('should select the current user', () => {
    const mockedState = fromJS({
      profile: {
        userData: {
          firstName: 'X',
          lastName: 'Y',
          gender: 'Male',
          email: 'a@b.cd',
        },
      },
    });
    expect(userDataSelector(mockedState).toJS()).toEqual(user);
  });
});
