import React from 'react';

import {
  Box,
  IconTooltip,
  Spinner,
  Text,
  colors,
} from '@citizenlab/cl2-component-library';
import { FormattedNumber } from 'react-intl';

import useSmsSendSummary from 'api/campaigns/sms/send_summary/useSmsSendSummary';
import { IGroupData } from 'api/groups/types';

import useLocalize from 'hooks/useLocalize';

import ButtonWithLink from 'components/UI/ButtonWithLink';
import Modal from 'components/UI/Modal';
import Warning from 'components/UI/Warning';

import { FormattedMessage, MessageDescriptor, useIntl } from 'utils/cl-intl';

import messages from '../../messages';

interface Props {
  opened: boolean;
  campaignId: string;
  selectedGroups: IGroupData[];
  noGroupsSelected: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isSending: boolean;
}

interface SummaryRowProps {
  label: MessageDescriptor;
  tooltip?: MessageDescriptor;
  children: React.ReactNode;
}

const SummaryRow = ({ label, tooltip, children }: SummaryRowProps) => (
  <Box display="flex" justifyContent="space-between" gap="16px" py="8px">
    <Text m="0px" color="textSecondary" display="flex">
      <FormattedMessage {...label} />
      {tooltip && (
        <IconTooltip
          ml="4px"
          iconSize="16px"
          content={<FormattedMessage {...tooltip} />}
        />
      )}
    </Text>
    <Text m="0px" fontWeight="bold" textAlign="right">
      {children}
    </Text>
  </Box>
);

const ConfirmSendModal = ({
  opened,
  campaignId,
  selectedGroups,
  noGroupsSelected,
  onClose,
  onConfirm,
  isSending,
}: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const { data: sendSummary } = useSmsSendSummary(campaignId, {
    enabled: opened,
  });

  const summary = sendSummary?.data.attributes;
  const recipientsCount = summary?.recipients_count ?? 0;
  const segmentsNeeded = summary?.segments_needed ?? 0;
  const segmentsBalance = summary?.segments_balance ?? 0;

  // A send that overspends is refused by the API too, so blocking here saves the
  // admin a failed attempt rather than being the only thing standing in the way.
  const insufficientBalance = !!summary && segmentsNeeded > segmentsBalance;
  const noRecipients = !!summary && recipientsCount === 0;

  return (
    <Modal
      opened={opened}
      close={onClose}
      header={<FormattedMessage {...messages.confirmSendSmsHeader2} />}
    >
      <Box p="30px">
        {summary ? (
          <>
            <Box mb="16px" borderBottom={`1px solid ${colors.divider}`}>
              <SummaryRow label={messages.fieldTo}>
                {noGroupsSelected ? (
                  <FormattedMessage {...messages.allUsers} />
                ) : (
                  selectedGroups
                    .map((group) => localize(group.attributes.title_multiloc))
                    .join(', ')
                )}
              </SummaryRow>
              <SummaryRow
                label={messages.confirmSendSmsRecipientsLabel}
                tooltip={messages.confirmSendSmsRecipientsTooltip}
              >
                <FormattedNumber value={recipientsCount} />
              </SummaryRow>
              <SummaryRow label={messages.confirmSendSmsCreditsLabel}>
                <FormattedNumber value={segmentsNeeded} />
              </SummaryRow>
              <SummaryRow label={messages.confirmSendSmsBalanceLabel}>
                <FormattedNumber value={segmentsBalance} />
              </SummaryRow>
            </Box>

            {insufficientBalance && (
              <Warning icon="alert-circle" mb="20px">
                {formatMessage(messages.confirmSendSmsInsufficientBalance, {
                  required: segmentsNeeded,
                  balance: segmentsBalance,
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
            dataCy="e2e-sms-send-confirm-button"
            buttonStyle="primary"
            icon="send"
            iconPos="right"
            onClick={onConfirm}
            processing={isSending}
            disabled={
              isSending || !summary || insufficientBalance || noRecipients
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
