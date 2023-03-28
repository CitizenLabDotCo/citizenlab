import React from 'react';

import SeatBillingInfo from './SeatBillingInfo';
import SeatTrackerInfo from './SeatTrackerInfo';

// Hooks
import useFeatureFlag from 'hooks/useFeatureFlag';

// Types
import { TSeatNumber } from 'api/app_configuration/types';
import { MessageDescriptor } from 'utils/cl-intl';

export type TSeatType = 'collaborator' | 'admin';

// Messages
export type SeatTypeMessageDescriptor = {
  [key in TSeatType]: MessageDescriptor;
};

export type SeatNumbersType = {
  [key in TSeatType]: TSeatNumber;
};

export type SeatInfoProps = {
  seatType: TSeatType;
};

const SeatInfo = ({ seatType }: SeatInfoProps) => {
  const hasSeatBasedBillingEnabled = useFeatureFlag({
    name: 'seat_based_billing',
  });

  if (hasSeatBasedBillingEnabled) {
    return <SeatBillingInfo seatType={seatType} />;
  }

  return <SeatTrackerInfo seatType={seatType} />;
};

export default SeatInfo;
