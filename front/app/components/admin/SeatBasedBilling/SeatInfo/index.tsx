import React from 'react';

import { TSeatNumber } from 'api/app_configuration/types';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { MessageDescriptor } from 'utils/cl-intl';

import BillingInfo from './BillingInfo';
import TrackerInfo from './TrackerInfo';

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
