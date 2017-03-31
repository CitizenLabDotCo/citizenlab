import { currentUserLoaded, currentUserLoadError, currentUserUpdated, storeCurrentUserError } from '../actions';

describe('actions', () => {
  const apiResponse = {
    data: {
      attributes: {},
      id: 'anything',
    },
  };

  it('should not return currentUserLoadError().type', () => {
    expect(currentUserLoaded(apiResponse)).not.toEqual(currentUserLoadError());
  });

  it('should not return storeCurrentUserError().type', () => {
    expect(currentUserUpdated(apiResponse)).not.toEqual(storeCurrentUserError());
  });
});
