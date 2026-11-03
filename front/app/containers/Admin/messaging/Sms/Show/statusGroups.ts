import { colors } from '@citizenlab/cl2-component-library';

import { SmsDeliveryStatus } from 'api/campaigns/sms/deliveries/types';

import { MessageDescriptor } from 'utils/cl-intl';

import messages from '../../messages';

export interface SmsStatusGroup {
  message: MessageDescriptor;
  color: string;
  statuses: SmsDeliveryStatus[];
}

// The 7 raw delivery statuses collapse into these 4 groups, in funnel order;
// transient statuses group under "pending" and all failure statuses under "failed".
export const SMS_STATUS_GROUPS: SmsStatusGroup[] = [
  {
    message: messages.smsDeliveryStatus_pending,
    color: colors.grey300,
    statuses: ['pending', 'queued'],
  },
  {
    message: messages.smsDeliveryStatus_sent,
    color: colors.blue500,
    statuses: ['sent'],
  },
  {
    message: messages.smsDeliveryStatus_delivered,
    color: colors.success,
    statuses: ['delivered'],
  },
  {
    message: messages.smsDeliveryStatus_failed,
    color: colors.red600,
    statuses: ['undelivered', 'failed', 'errored'],
  },
];

// Lookup from each raw status to its group, for row-level display.
const buildStatusGroupLookup = (): Record<
  SmsDeliveryStatus,
  SmsStatusGroup
> => {
  const lookup = {} as Record<SmsDeliveryStatus, SmsStatusGroup>;
  for (const group of SMS_STATUS_GROUPS) {
    for (const status of group.statuses) {
      lookup[status] = group;
    }
  }
  return lookup;
};

export const smsStatusGroupByStatus = buildStatusGroupLookup();
