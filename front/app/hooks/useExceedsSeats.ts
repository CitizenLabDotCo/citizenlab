import useSeats from 'api/seats/useSeats';
import { isNil } from 'utils/helperUtils';
import { useAvailableSeats } from './useAvailableSeats';

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

export const useExceedsSeats = (): ((
  params: ReturnFunctionParameters
) => ExceedsSeats) => {
  const availableSeats = useAvailableSeats();
  const { data: seats } = useSeats();

  if (isNil(seats) || isNil(availableSeats))
    return (_params: ReturnFunctionParameters) => ({
      admin: false,
      moderator: false,
      any: false,
      all: false,
    });

  const { availableAdminSeats, availableModeratorSeats } = availableSeats;

  return ({
    newlyAddedAdminsNumber,
    newlyAddedModeratorsNumber,
  }: ReturnFunctionParameters) => {
    const exceedsAdminSeats = availableAdminSeats
      ? seats.data.attributes.admins_number + newlyAddedAdminsNumber >
        availableAdminSeats
      : false;
    const exceedsModeratorSeats = availableModeratorSeats
      ? seats.data.attributes.project_moderators_number +
          newlyAddedModeratorsNumber >
        availableModeratorSeats
      : false;
    return {
      admin: exceedsAdminSeats,
      moderator: exceedsModeratorSeats,
      any: exceedsAdminSeats || exceedsModeratorSeats,
      all: exceedsAdminSeats && exceedsModeratorSeats,
    };
  };
};
