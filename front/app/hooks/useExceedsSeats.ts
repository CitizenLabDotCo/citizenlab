// import useSeats from 'api/seats/useSeats';

// import { isNil } from 'utils/helperUtils';

// import useTotalSeats from './useTotalSeats';

// export interface NewlyAddedSeats {
//   newlyAddedAdminsNumber?: number;
//   newlyAddedModeratorsNumber?: number;
// }

// interface ExceedsSeats {
//   admin: boolean;
//   moderator: boolean;
//   any: boolean;
//   all: boolean;
// }

// export default function useExceedsSeats(): (
//   params: NewlyAddedSeats
// ) => ExceedsSeats {
//   const totalSeats = useTotalSeats();
//   const { data: seats } = useSeats();

//   if (isNil(seats) || isNil(totalSeats)) {
//     return (_params: NewlyAddedSeats) => ({
//       admin: false,
//       moderator: false,
//       any: false,
//       all: false,
//     });
//   }

//   const { totalAdminSeats, totalModeratorSeats } = totalSeats;

//   return ({
//     newlyAddedAdminsNumber,
//     newlyAddedModeratorsNumber,
//   }: NewlyAddedSeats) => {
//     const expectedNewAdminSeats =
//       seats.data.attributes.admins_number + (newlyAddedAdminsNumber ?? 0);
//     const expectedNewModeratorSeats =
//       seats.data.attributes.moderators_number +
//       (newlyAddedModeratorsNumber ?? 0);

//     const exceedsAdminSeats = totalAdminSeats
//       ? expectedNewAdminSeats > totalAdminSeats
//       : false;
//     const exceedsModeratorSeats = totalModeratorSeats
//       ? expectedNewModeratorSeats > totalModeratorSeats
//       : false;
//     return {
//       admin: exceedsAdminSeats,
//       moderator: exceedsModeratorSeats,
//       any: exceedsAdminSeats || exceedsModeratorSeats,
//       all: exceedsAdminSeats && exceedsModeratorSeats,
//     };
//   };
// }

import { useMemo } from 'react';

import useSeats from 'api/seats/useSeats';
import { IUserData } from 'api/users/types';

import useTotalSeats from './useTotalSeats';

interface Params {
  roleToBeAdded: 'admin' | 'moderator';
}

const useExceedsSeats = ({ roleToBeAdded }: Params) => {
  const totalSeats = useTotalSeats();
  const { data: seats } = useSeats();

  const getExceedsSeats = useMemo(() => {
    if (!seats || !totalSeats) return undefined;

    return (userToBeAdded: IUserData) => {
      const highestRole = userToBeAdded.attributes.highest_role ?? 'user';

      // If admin...
      if (roleToBeAdded === 'admin') {
        if (highestRole === 'admin' || highestRole === 'super_admin') {
          // If user is already an admin, no extra seat is needed
          return false;
        }

        const currentAdminSeats = seats.data.attributes.admins_number;
        const totalAdminSeats = totalSeats.totalAdminSeats ?? 0;
        return currentAdminSeats + 1 > totalAdminSeats;
      }

      // If moderator...
      if (highestRole !== 'user') {
        // A new seat is only needed if a user is promoted to moderator.
        // If the user is already a moderator or admin, no extra seat is needed
        return { loading: false, exceedsSeats: false };
      }

      const currentModeratorSeats = seats.data.attributes.moderators_number;
      const totalModeratorSeats = totalSeats.totalModeratorSeats ?? 0;
      return currentModeratorSeats + 1 > totalModeratorSeats;
    };
  }, [roleToBeAdded, totalSeats, seats]);

  if (!getExceedsSeats) return { loading: true } as const;

  return {
    loading: false,
    getExceedsSeats,
  } as const;
};

export default useExceedsSeats;
