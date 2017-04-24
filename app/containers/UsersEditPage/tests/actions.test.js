import {
  loadCurrentUserError, loadCurrentUserSuccess, updateCurrentUserError, updateCurrentUserSuccess,
} from '../actions';

describe('actions', () => {
  const apiResponse = {
    data: {
      attributes: {},
      id: 'anything',
    },
  };

  it('should not return loadCurrentUserError().type', () => {
    expect(loadCurrentUserSuccess(apiResponse)).not.toEqual(loadCurrentUserError());
  });

  it('should not return storeCurrentUserError().type', () => {
    expect(updateCurrentUserSuccess(apiResponse)).not.toEqual(updateCurrentUserError());
  });
});
