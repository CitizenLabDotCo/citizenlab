import useSeats from 'api/seats/useSeats';
import { isNil } from 'utils/helperUtils';
import useTotalSeats from './useTotalSeats';

interface ReturnFunctionParameters {
  newlyAddedAdminsNumber: number;
  newlyAddedModeratorsNumber: number;
}

interface ExceedsSeats {
  admin: boolean;
  moderator: boolean;
  any: boolean;
  all: boolean;
}

export default function useExceedsSeats(): (
  params: ReturnFunctionParameters
) => ExceedsSeats {
  const totalSeats = useTotalSeats();
  const { data: seats } = useSeats();

  if (isNil(seats) || isNil(totalSeats))
    return (_params: ReturnFunctionParameters) => ({
      admin: false,
      moderator: false,
      any: false,
      all: false,
    });

  const { totalAdminSeats, totalModeratorSeats } = totalSeats;

  return ({
    newlyAddedAdminsNumber,
    newlyAddedModeratorsNumber,
  }: ReturnFunctionParameters) => {
    const expectedNewAdminSeats =
      seats.data.attributes.admins_number + newlyAddedAdminsNumber;
    const expectedNewModeratorSeats =
      seats.data.attributes.moderators_number + newlyAddedModeratorsNumber;

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
  };
}
