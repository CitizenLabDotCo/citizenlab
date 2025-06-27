import { renderHook } from 'utils/testUtils/rtl';

import useExceedsSeats from './useExceedsSeats';

jest.mock('api/seats/useSeats', () =>
  jest.fn(() => ({
    data: {
      data: {
        attributes: {
          admins_number: 2,
          moderators_number: 3,
        },
      },
    },
  }))
);

jest.mock('api/app_configuration/useAppConfiguration', () =>
  jest.fn(() => ({
    data: {
      data: {
        attributes: {
          settings: {
            core: {
              maximum_admins_number: 4,
              maximum_moderators_number: 5,
              additional_admins_number: 1,
              additional_moderators_number: 1,
            },
          },
        },
      },
    },
  }))
);

jest.mock('./useFeatureFlag', () => {
  return jest.fn(() => true);
});

describe('useExceedsSeats', () => {
  it('should return correct values when not exceeding any limits', () => {
    const { result } = renderHook(() => useExceedsSeats());
    const exceedsSeats = result.current({
      newlyAddedAdminsNumber: 2,
      newlyAddedModeratorsNumber: 2,
    });

    expect(exceedsSeats).toEqual({
      admin: false,
      moderator: false,
      any: false,
      all: false,
    });
  });

  it('should return correct values when exceeding admin limit', () => {
    const { result } = renderHook(() => useExceedsSeats());
    const exceedsSeats = result.current({
      newlyAddedAdminsNumber: 4,
      newlyAddedModeratorsNumber: 2,
    });

    expect(exceedsSeats).toEqual({
      admin: true,
      moderator: false,
      any: true,
      all: false,
    });
  });

  it('should return correct values when exceeding moderator limit', () => {
    const { result } = renderHook(() => useExceedsSeats());
    const exceedsSeats = result.current({
      newlyAddedAdminsNumber: 1,
      newlyAddedModeratorsNumber: 4,
    });

    expect(exceedsSeats).toEqual({
      admin: false,
      moderator: true,
      any: true,
      all: false,
    });
  });

  it('should return correct values when exceeding both limits', () => {
    const { result } = renderHook(() => useExceedsSeats());
    const exceedsSeats = result.current({
      newlyAddedAdminsNumber: 4,
      newlyAddedModeratorsNumber: 4,
    });

    expect(exceedsSeats).toEqual({
      admin: true,
      moderator: true,
      any: true,
      all: true,
    });
  });

  it('should return correct values when equal to the admin limit', () => {
    const { result } = renderHook(() => useExceedsSeats());
    const exceedsSeats = result.current({
      newlyAddedAdminsNumber: 3,
      newlyAddedModeratorsNumber: 0,
    });

    expect(exceedsSeats).toEqual({
      admin: false,
      moderator: false,
      any: false,
      all: false,
    });
  });

  it('should return correct values when equal to the moderator limit', () => {
    const { result } = renderHook(() => useExceedsSeats());
    const exceedsSeats = result.current({
      newlyAddedAdminsNumber: 0,
      newlyAddedModeratorsNumber: 3,
    });

    expect(exceedsSeats).toEqual({
      admin: false,
      moderator: false,
      any: false,
      all: false,
    });
  });

  it('should return correct values when exceeding the admin limit by 1', () => {
    const { result } = renderHook(() => useExceedsSeats());
    const exceedsSeats = result.current({
      newlyAddedAdminsNumber: 4,
      newlyAddedModeratorsNumber: 0,
    });

    expect(exceedsSeats).toEqual({
      admin: true,
      moderator: false,
      any: true,
      all: false,
    });
  });

  it('should return correct values when exceeding the moderator limit by 1', () => {
    const { result } = renderHook(() => useExceedsSeats());
    const exceedsSeats = result.current({
      newlyAddedAdminsNumber: 0,
      newlyAddedModeratorsNumber: 4,
    });

    expect(exceedsSeats).toEqual({
      admin: false,
      moderator: true,
      any: true,
      all: false,
    });
  });
});
