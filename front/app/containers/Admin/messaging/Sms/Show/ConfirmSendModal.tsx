import React from 'react';

import { Box, Spinner, Text, colors } from '@citizenlab/cl2-component-library';
import { FormattedNumber } from 'react-intl';
import { Multiloc } from 'typings';

import useSmsBalance from 'api/campaigns/sms/balance/useSmsBalance';
import useSmsCampaignRecipients from 'api/campaigns/sms/recipients/useSmsCampaignRecipients';

import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';

import ButtonWithLink from 'components/UI/ButtonWithLink';
import Modal from 'components/UI/Modal';
import Warning from 'components/UI/Warning';

import { FormattedMessage, MessageDescriptor, useIntl } from 'utils/cl-intl';

import messages from '../../messages';
import { creditsForSend } from '../utils/segments';

interface Props {
  opened: boolean;
  campaignId: string;
  bodyMultiloc: Multiloc;
  onClose: () => void;
  onConfirm: () => void;
  isSending: boolean;
}

interface SummaryRowProps {
  label: MessageDescriptor;
  value: number;
}

const SummaryRow = ({ label, value }: SummaryRowProps) => (
  <Box display="flex" justifyContent="space-between" py="8px">
    <Text m="0px" color="textSecondary">
      <FormattedMessage {...label} />
    </Text>
    <Text m="0px" fontWeight="bold">
      <FormattedNumber value={value} />
    </Text>
  </Box>
);

const ConfirmSendModal = ({
  opened,
  campaignId,
  bodyMultiloc,
  onClose,
  onConfirm,
  isSending,
}: Props) => {
  const { formatMessage } = useIntl();
  const tenantLocales = useAppConfigurationLocales();
  const { data: recipients } = useSmsCampaignRecipients(campaignId, {
    enabled: opened,
  });
  const { data: smsBalance } = useSmsBalance();

  const loaded = !!recipients && !!smsBalance && !!tenantLocales;

  const recipientsCount = recipients?.data.attributes.count ?? 0;
  const balance = smsBalance?.data.attributes.balance ?? 0;
  const credits = loaded
    ? creditsForSend(
        bodyMultiloc,
        recipients.data.attributes.count_by_locale,
        tenantLocales
      )
    : 0;

  // A send that overspends is refused by the API too, so blocking here saves the
  // admin a failed attempt rather than being the only thing standing in the way.
  const insufficientBalance = loaded && credits > balance;
  const noRecipients = loaded && recipientsCount === 0;

  return (
    <Modal
      opened={opened}
      close={onClose}
      header={<FormattedMessage {...messages.confirmSendSmsHeader2} />}
    >
      <Box p="30px">
        {loaded ? (
          <>
            <Box mb="16px" borderBottom={`1px solid ${colors.divider}`}>
              <SummaryRow
                label={messages.confirmSendSmsRecipientsLabel}
                value={recipientsCount}
              />
              <SummaryRow
                label={messages.confirmSendSmsCreditsLabel}
                value={credits}
              />
              <SummaryRow
                label={messages.confirmSendSmsBalanceLabel}
                value={balance}
              />
            </Box>

            {insufficientBalance && (
              <Warning icon="alert-circle" mb="20px">
                {formatMessage(messages.confirmSendSmsInsufficientBalance, {
                  required: credits,
                  balance,
                })}
              </Warning>
            )}

            {noRecipients && (
              <Warning icon="alert-circle" mb="20px">
                {formatMessage(messages.confirmSendSmsNoRecipients)}
              </Warning>
            )}

            {!insufficientBalance && !noRecipients && (
              <Text mt="0px" mb="20px" fontSize="s" color="textSecondary">
                <FormattedMessage {...messages.confirmSendSmsCreditsHint} />
              </Text>
            )}
          </>
        ) : (
          <Box display="flex" justifyContent="center" mb="20px">
            <Spinner />
          </Box>
        )}

        <Box display="flex" gap="10px" justifyContent="flex-end">
          <ButtonWithLink buttonStyle="secondary-outlined" onClick={onClose}>
            <FormattedMessage {...messages.changeRecipientsButton} />
          </ButtonWithLink>
          <ButtonWithLink
            buttonStyle="primary"
            icon="send"
            iconPos="right"
            onClick={onConfirm}
            processing={isSending}
            disabled={
              isSending || !loaded || insufficientBalance || noRecipients
            }
          >
            <FormattedMessage {...messages.sendNowButton} />
          </ButtonWithLink>
        </Box>
      </Box>
    </Modal>
  );
};

export default ConfirmSendModal;
