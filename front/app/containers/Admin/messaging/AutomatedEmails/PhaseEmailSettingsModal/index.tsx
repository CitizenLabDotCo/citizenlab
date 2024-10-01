import React from 'react';

import { Title, Button, Text, Box } from '@citizenlab/cl2-component-library';

import useLocalize from 'hooks/useLocalize';

import Modal from 'components/UI/Modal';
import Warning from 'components/UI/Warning';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import { CampaignData } from '../types';

import messages from './messages';

type Props = {
  open: boolean;
  close: () => void;
  onConfirm: () => void;
  campaign: CampaignData;
};

const PhaseEmailSettingsModal = ({
  open,
  close,
  onConfirm,
  campaign,
}: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const isEnabled = campaign.attributes.enabled;
  const emailCampaignName = (
    <b>{localize(campaign.attributes.campaign_description_multiloc)}</b>
  );

  const handleConfirmClick = () => {
    onConfirm();
    close();
  };

  return (
    <Modal close={close} opened={open}>
      <Title variant="h3" m="35px 0 30px">
        <FormattedMessage
          {...(isEnabled
            ? messages.turnEmailCampaignOff
            : messages.turnEmailCampaignOn)}
          values={{
            emailCampaignName,
          }}
        />
      </Title>
      <Text>
        <FormattedMessage
          {...(isEnabled ? messages.disabledMessage : messages.enabledMessage)}
          values={{
            emailCampaignName,
          }}
        />
      </Text>
      {isEnabled && (
        <Box mb="32px">
          <Warning>{formatMessage(messages.alternatively)}</Warning>
        </Box>
      )}
      <Box
        display="flex"
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
      >
        <Button
          data-testid="unblockBtn"
          onClick={handleConfirmClick}
          w="100%"
          mr="16px"
        >
          {formatMessage(isEnabled ? messages.turnOff : messages.turnOn)}
        </Button>
        <Button buttonStyle="secondary-outlined" onClick={close} w="100%">
          {formatMessage(messages.cancel)}
        </Button>
      </Box>
    </Modal>
  );
};

export default PhaseEmailSettingsModal;
