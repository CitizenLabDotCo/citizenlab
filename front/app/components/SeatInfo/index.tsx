import React from 'react';

import SeatBillingInfo from './SeatBillingInfo';
import SeatTrackerInfo from './SeatTrackerInfo';

// Hooks
import useFeatureFlag from 'hooks/useFeatureFlag';

export type TSeatType = 'collaborator' | 'admin';

type Props = {
  seatType: TSeatType;
};

const SeatInfo = ({ seatType }: Props) => {
  const hasSeatBasedBillingEnabled = useFeatureFlag({
    name: 'seat_based_billing',
  });

  if (hasSeatBasedBillingEnabled) {
    return <SeatBillingInfo seatType={seatType} />;
  }

  return <SeatTrackerInfo seatType={seatType} />;
};

export default SeatInfo;
