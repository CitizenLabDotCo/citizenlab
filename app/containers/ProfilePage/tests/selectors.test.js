import { fromJS } from 'immutable';
import { makeSelectUserData, makeSelectError, makeSelectLoading } from '../selectors';

describe('makeSelectProfilePageDomain', () => {
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

  const errorSelector = makeSelectError();
  it('should select the error', () => {
    const error = 404;
    const mockedState = fromJS({
      profile: {
        error,
      },
    });
    expect(errorSelector(mockedState)).toEqual(error);
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
          user: {
            firstName: 'X',
            lastName: 'Y',
            gender: 'Male',
            email: 'a@b.cd',
          },
        },
      },
    });
    expect(userDataSelector(mockedState).toJS()).toEqual(user);
  });
});
