import { useMemo } from 'react';

import useSeats from 'api/seats/useSeats';

import useTotalSeats from './useTotalSeats';

interface NewlyAddedSeats {
  newlyAddedAdminsNumber: number;
  newlyAddedModeratorsNumber: number;
}

const useExceedsSeats = () => {
  const totalSeats = useTotalSeats();
  const { data: seats } = useSeats();

  const checkIfSeatsExceeded = useMemo(() => {
    if (!seats || !totalSeats) return undefined;

    return ({
      newlyAddedAdminsNumber,
      newlyAddedModeratorsNumber,
    }: NewlyAddedSeats) => {
      const { totalAdminSeats, totalModeratorSeats } = totalSeats;
      const expectedNewAdminSeats =
        seats.data.attributes.admins_number + newlyAddedAdminsNumber;
      const expectedNewModeratorSeats =
        seats.data.attributes.moderators_number + newlyAddedModeratorsNumber;

      // If totalAdminSeats is blank, it should be interpreted as unlimited
      const exceedsAdminSeats = totalAdminSeats
        ? expectedNewAdminSeats > totalAdminSeats
        : false;

      // If totalModeratorSeats is blank, it should be interpreted as unlimited
      const exceedsModeratorSeats = totalModeratorSeats
        ? expectedNewModeratorSeats > totalModeratorSeats
        : false;

      return {
        admin: exceedsAdminSeats,
        moderator: exceedsModeratorSeats,
        any: exceedsAdminSeats || exceedsModeratorSeats,
        all: exceedsAdminSeats && exceedsModeratorSeats,
      };
    };
  }, [seats, totalSeats]);

  if (!checkIfSeatsExceeded) {
    return { loading: true } as const;
  }

  return {
    loading: false,
    checkIfSeatsExceeded,
  } as const;
};

export default useExceedsSeats;
