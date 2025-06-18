import React, { useEffect, useState } from 'react';

import {
  Button,
  Box,
  Text,
  IconTooltip,
  fontSizes,
} from '@citizenlab/cl2-component-library';

import useCampaignExamples from 'api/campaign_examples/useCampaignExamples';
import useCampaign from 'api/campaigns/useCampaign';

import PreviewFrame from 'components/admin/Email/PreviewFrame';
import T from 'components/T';
import Modal from 'components/UI/Modal';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';

import messages from '../../messages';

import EmptyState from './EmptyState';
import ExampleFrame from './ExampleFrame';
import useFeatureFlag from 'hooks/useFeatureFlag';
import styled from 'styled-components';
import useSendCampaignPreview from 'api/campaigns/useSendCampaignPreview';

/** Modulo function, since JS's native `%` remainder function works differently for negative numbers */
const mod = (n: number, m: number) => ((n % m) + m) % m;

const SendTestEmailButton = styled.button`
  text-decoration: underline;
  font-size: ${fontSizes.base}px;
  cursor: pointer;
`;

const ExampleModal = ({
  campaignId,
  onClose,
}: {
  campaignId: string;
  onClose: () => void;
}) => {
  const { data: examples, isLoading } = useCampaignExamples({ campaignId });
  const { data: campaign } = useCampaign(campaignId);
  const [selectedExampleIdx, setSelectedExampleIdx] = useState<number | null>(
    null
  );
  const isEditingEnabled = useFeatureFlag({
    name: 'customised_automated_emails',
  });
  const { mutate: sendCampaignPreview, isLoading: isSendingCampaignPreview } =
    useSendCampaignPreview();
  const { formatMessage } = useIntl();

  useEffect(() => {
    if (examples?.data.length) {
      setSelectedExampleIdx(0);
    }
  }, [examples]);

  const changeSelectedExample = (offset: number) => {
    setSelectedExampleIdx((idx) =>
      mod((idx || 0) + offset, examples?.data.length || 1)
    );
  };

  if (isNilOrError(examples) || !campaign) return null;

  const selectedExample =
    selectedExampleIdx === null ? null : examples.data[selectedExampleIdx];

  // New preview only works with editing enabled & where the BE has a preview class
  // TODO: Seems to call preview twice
  const hasPreview = isEditingEnabled && campaign.data.attributes.has_preview;

  const handleSendPreviewEmail = () => {
    sendCampaignPreview(campaignId, {
      onSuccess: () => {
        const previewSentConfirmation = formatMessage(
          messages.previewSentConfirmation
        );
        window.alert(previewSentConfirmation);
      },
    });
  };

  return (
    <Modal
      opened={true}
      close={() => onClose()}
      header={
        <T value={campaign.data.attributes.campaign_description_multiloc} />
      }
    >
      <Box mx="30px" mt="30px">
        {!isLoading && examples.data.length === 0 && !hasPreview && (
          <EmptyState />
        )}
        {!isLoading && hasPreview && (
          <>
            <Box mb="30px" display="flex" alignItems="center">
              <SendTestEmailButton
                onClick={handleSendPreviewEmail}
                disabled={isSendingCampaignPreview}
              >
                <FormattedMessage {...messages.sendTestEmailButton} />
              </SendTestEmailButton>
              &nbsp;
              <IconTooltip
                content={
                  <FormattedMessage {...messages.sendTestEmailTooltip} />
                }
              />
            </Box>
            <PreviewFrame campaignId={campaign.data.id} showSubject={true} />
          </>
        )}
        {!isLoading &&
          !hasPreview &&
          examples.data.length !== 0 &&
          selectedExampleIdx !== null && (
            <Box>
              {selectedExample && (
                <ExampleFrame example={selectedExample} campaign={campaign} />
              )}
              <Box display="flex" justifyContent="center" alignItems="center">
                <Button
                  m="2px"
                  p="4px"
                  maxWidth="32px"
                  icon="chevron-left"
                  buttonStyle="secondary-outlined"
                  onClick={() => changeSelectedExample(-1)}
                />
                <Box mx="24px" w="30px" display="flex" justifyContent="center">
                  <Text color="blue500" fontSize="m">
                    {selectedExampleIdx + 1}/{examples.data.length}
                  </Text>
                </Box>
                <Button
                  m="2px"
                  p="4px"
                  maxWidth="32px"
                  icon="chevron-right"
                  buttonStyle="secondary-outlined"
                  onClick={() => changeSelectedExample(1)}
                />
              </Box>
              <Box display="flex" w="100%" justifyContent="center">
                <Text color="grey500">
                  <FormattedMessage {...messages.sentToUsers} />
                </Text>
              </Box>
            </Box>
          )}
      </Box>
    </Modal>
  );
};

export default ExampleModal;
