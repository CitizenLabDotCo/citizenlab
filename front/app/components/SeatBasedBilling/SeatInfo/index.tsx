import React from 'react';
import BillingInfo from './BillingInfo';
import TrackerInfo from './TrackerInfo';
import useFeatureFlag from 'hooks/useFeatureFlag';
import { TSeatNumber } from 'api/app_configuration/types';
import { MessageDescriptor } from 'utils/cl-intl';

export type TSeatType = 'moderator' | 'admin';

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
    return <BillingInfo seatType={seatType} />;
  }
  return <TrackerInfo seatType={seatType} />;
};

export default SeatInfo;
