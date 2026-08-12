import React from 'react';

import {
  Box,
  BoxMarginProps,
  Text,
  colors,
} from '@citizenlab/cl2-component-library';
import { FormattedNumber } from 'react-intl';

import useSmsBalance from 'api/campaigns/sms/balance/useSmsBalance';

import Warning from 'components/UI/Warning';

import { FormattedMessage, MessageDescriptor, useIntl } from 'utils/cl-intl';

import messages from '../../messages';

// Below this many messages left, we nudge the admin to buy more.
export const LOW_BALANCE_THRESHOLD = 100;

interface BreakdownItemProps {
  label: MessageDescriptor;
  value: number;
}

const BreakdownItem = ({ label, value }: BreakdownItemProps) => (
  <Box>
    <Text m="0px" fontSize="l">
      <FormattedNumber value={value} />
    </Text>
    <Text m="0px" fontSize="s" color="textSecondary">
      <FormattedMessage {...label} />
    </Text>
  </Box>
);

const SmsBalance = (boxMarginProps: BoxMarginProps) => {
  const { formatMessage } = useIntl();
  const { data: smsBalance } = useSmsBalance();

  if (!smsBalance) return null;

  const { purchased, used, balance, used_manual, used_other } =
    smsBalance.data.attributes;

  const isLow = balance < LOW_BALANCE_THRESHOLD;

  return (
    <Box background={colors.white} p="32px" {...boxMarginProps}>
      <Text m="0px" fontWeight="bold" color="textSecondary">
        <FormattedMessage {...messages.smsBalanceTitle} />
      </Text>

      <Box display="flex" alignItems="baseline" gap="8px" mt="4px">
        <Text
          m="0px"
          fontSize="xxxl"
          fontWeight="bold"
          color={isLow ? 'red600' : 'primary'}
        >
          <FormattedNumber value={balance} />
        </Text>
        <Text m="0px" color="textSecondary">
          <FormattedMessage
            {...messages.smsBalanceOfPurchased}
            values={{ purchased }}
          />
        </Text>
      </Box>

      {isLow ? (
        <Warning icon="alert-circle" mt="20px">
          {formatMessage(messages.smsBalanceLowWarning)}
        </Warning>
      ) : (
        <Text mt="12px" mb="0px" fontSize="s" color="textSecondary">
          <FormattedMessage {...messages.smsBalancePurchaseHint} />
        </Text>
      )}

      <Box display="flex" gap="48px" mt="24px" flexWrap="wrap">
        <BreakdownItem
          label={messages.smsBalanceUsedManual}
          value={used_manual}
        />
        {/* Preview/test sends are real, billed messages, but belong to no
            campaign. Only worth surfacing once there are any. */}
        {used_other > 0 && (
          <BreakdownItem
            label={messages.smsBalanceUsedOther}
            value={used_other}
          />
        )}
        <BreakdownItem label={messages.smsBalanceUsedTotal} value={used} />
      </Box>
    </Box>
  );
};

export default SmsBalance;
