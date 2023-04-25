import useSeats from 'api/seats/useSeats';
import { isNil } from 'utils/helperUtils';
import useTotalSeats from './useTotalSeats';

interface NewlyAddedSeats {
  newlyAddedAdminsNumber?: number | null;
  newlyAddedModeratorsNumber?: number | null;
}

interface ExceedsSeats {
  admin: boolean;
  moderator: boolean;
  any: boolean;
  all: boolean;
}

export default function useExceedsSeats({
  newlyAddedAdminsNumber,
  newlyAddedModeratorsNumber,
}: NewlyAddedSeats): ExceedsSeats {
  const totalSeats = useTotalSeats();
  const { data: seats } = useSeats();

  if (isNil(seats) || isNil(totalSeats)) {
    return {
      admin: false,
      moderator: false,
      any: false,
      all: false,
    };
  }

  const { totalAdminSeats, totalModeratorSeats } = totalSeats;

  const expectedNewAdminSeats =
    seats.data.attributes.admins_number + (newlyAddedAdminsNumber ?? 0);
  const expectedNewModeratorSeats =
    seats.data.attributes.moderators_number + (newlyAddedModeratorsNumber ?? 0);

  const exceedsAdminSeats = totalAdminSeats
    ? expectedNewAdminSeats > totalAdminSeats
    : false;
  const exceedsModeratorSeats = totalModeratorSeats
    ? expectedNewModeratorSeats > totalModeratorSeats
    : false;

  return {
    admin: exceedsAdminSeats,
    moderator: exceedsModeratorSeats,
    any: exceedsAdminSeats || exceedsModeratorSeats,
    all: exceedsAdminSeats && exceedsModeratorSeats,
  };
}
