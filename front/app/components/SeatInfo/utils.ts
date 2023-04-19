import { TSeatNumber } from 'api/app_configuration/types';
import { isNil } from 'utils/helperUtils';

type ExceededLimitType = {
  hasReachedOrIsOverPlanSeatLimit: boolean;
  hasExceededPlanSeatLimit: boolean;
};

// TODO: Remove or simplify this function after seat based billing
// Pulling this out to reduce comlexity and make it easy to read where it is used. This will go away once we are stable and have enabled the second iteration of seat based billing for all clients
export const getExceededLimitInfo = (
  hasSeatBasedBillingEnabled: boolean,
  currentSeatTypeSeats: number, // admins_number or moderators_number
  additionalSeatTypeSeats: TSeatNumber, // additional_admins_number or additional_moderators_number
  maximumSeatTypeSeats: TSeatNumber // maximum_admins_number or maximum_moderators_number
): ExceededLimitType => {
  // If maximumSeatTypeSeats isNil, then that means unlimited seats and therefore exceeding is not possible
  if (isNil(maximumSeatTypeSeats)) {
    return {
      hasReachedOrIsOverPlanSeatLimit: false,
      hasExceededPlanSeatLimit: false,
    };
  } else if (!hasSeatBasedBillingEnabled) {
    // We use maximumSeatTypeSeats (maximum_admins_number or maximum_moderators_number) because saving additionalSeatTypeSeats (additional_admins_number or additional_moderators_number) is a concept in the second iteration
    return {
      hasReachedOrIsOverPlanSeatLimit:
        currentSeatTypeSeats >= maximumSeatTypeSeats,
      hasExceededPlanSeatLimit: currentSeatTypeSeats > maximumSeatTypeSeats,
    };
  }
  const seatLimit = !isNil(additionalSeatTypeSeats)
    ? additionalSeatTypeSeats + maximumSeatTypeSeats
    : maximumSeatTypeSeats;

  return {
    hasReachedOrIsOverPlanSeatLimit: currentSeatTypeSeats >= seatLimit,
    hasExceededPlanSeatLimit: currentSeatTypeSeats > seatLimit,
  };
};
