import { currentUserLoaded, currentUserLoadError, storeCurrentUserError, } from '../actions';

describe('actions', () => {
  it('should return currentUserLoadError().type if profile is null', () => {
    expect(currentUserLoaded(undefined)).toEqual(currentUserLoadError());
  });

  it('should return storeCurrentUserError().type if profile is null', () => {
    expect(profileStored(undefined)).toEqual(storeCurrentUserError());
  });
});
