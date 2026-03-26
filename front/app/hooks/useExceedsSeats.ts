import { useMemo } from 'react';

import useSeats from 'api/seats/useSeats';
import { IUserData } from 'api/users/types';

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

  const checkIfUserExceedsSeats = useMemo(() => {
    if (!seats || !totalSeats) return undefined;

    return (userToBeAdded: IUserData, roleToBeAdded: 'admin' | 'moderator') => {
      const highestRole = userToBeAdded.attributes.highest_role ?? 'user';

      // If admin...
      if (roleToBeAdded === 'admin') {
        if (highestRole === 'admin' || highestRole === 'super_admin') {
          // If user is already an admin, no extra seat is needed
          // This should not be possible anyway
          return false;
        }

        const currentAdminSeats = seats.data.attributes.admins_number;
        const totalAdminSeats = totalSeats.totalAdminSeats;

        // If totalAdminSeats is blank, it should be interpreted as unlimited
        if (!totalAdminSeats) return false;
        return currentAdminSeats + 1 > totalAdminSeats;
      }

      // If moderator...
      if (highestRole !== 'user') {
        // A new seat is only needed if a user is promoted to moderator.
        // If the user is already a moderator or admin, no extra seat is needed
        return false;
      }

      const currentModeratorSeats = seats.data.attributes.moderators_number;
      const totalModeratorSeats = totalSeats.totalModeratorSeats;

      // If totalModeratorSeats is blank, it should be interpreted as unlimited
      if (!totalModeratorSeats) return false;
      return currentModeratorSeats + 1 > totalModeratorSeats;
    };
  }, [totalSeats, seats]);

  if (!checkIfSeatsExceeded || !checkIfUserExceedsSeats) {
    return { loading: true } as const;
  }

  return {
    loading: false,
    checkIfSeatsExceeded,
    checkIfUserExceedsSeats,
  } as const;
};

export default useExceedsSeats;
