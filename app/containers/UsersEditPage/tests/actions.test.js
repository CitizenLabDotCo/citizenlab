import {
  avatarLoaded, avatarStored, loadAvatarError, profileLoaded, profileLoadError,
  profileStored, storeAvatarError, storeProfileError,
} from '../actions';
describe('actions', () => {
  it('should return profileLoadError().type if profile is null', () => {
    expect(profileLoaded(undefined)).toEqual(profileLoadError());
  });

  it('should return profileStoreError().type if profile is null', () => {
    expect(profileStored(undefined)).toEqual(storeProfileError());
  });

  it('should return loadAvatarError().type if avatar is null', () => {
    expect(avatarLoaded(undefined)).toEqual(loadAvatarError());
  });

  it('should return avatarStoreError().type if avatar is null', () => {
    expect(avatarStored(undefined)).toEqual(storeAvatarError());
  });
});
