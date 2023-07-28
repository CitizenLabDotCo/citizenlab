import React from 'react';
import Modal from 'components/UI/Modal';
import { Title, Button, Text, Box } from '@citizenlab/cl2-component-library';
import { useIntl } from 'utils/cl-intl';
import messages from './messages';
import { CampaignData } from '../types';

type Props = {
  open: boolean;
  close: () => void;
  onConfirm: () => void;
  campaign: CampaignData;
};

const NewProjectPhaseModal = ({ open, close, onConfirm, campaign }: Props) => {
  const { formatMessage } = useIntl();
  const isEnabled = campaign.attributes.enabled;
  const title = isEnabled
    ? messages.turnEmailCampaignOff
    : messages.turnEmailCampaignOn;
  const message = isEnabled
    ? messages.disabledMessage
    : messages.enabledMessage;
  const confirmText = isEnabled ? messages.turnOff : messages.turnOn;

  const handleConfirmClick = () => {
    onConfirm();
    close();
  };

  return (
    <Modal close={close} opened={open}>
      <Title variant="h3" m="35px 0 30px">
        {formatMessage(title)}
      </Title>
      <Text>{formatMessage(message)}</Text>

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
          {formatMessage(confirmText)}
        </Button>
        <Button buttonStyle="secondary" onClick={close} w="100%">
          {formatMessage(messages.cancel)}
        </Button>
      </Box>
    </Modal>
  );
};

export default NewProjectPhaseModal;
