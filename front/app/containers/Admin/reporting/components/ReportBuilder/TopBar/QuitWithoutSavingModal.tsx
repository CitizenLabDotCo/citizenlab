import React from 'react';

// components
import Modal from 'components/UI/Modal';
import { Box, Text, Button } from '@citizenlab/cl2-component-library';

// utils
import clHistory from 'utils/cl-router/history';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

interface Props {
  open: boolean;
  onClose: () => void;
  setShareModalOpen: (bool: boolean) => void;
}

const QuitWithoutSavingModal = ({
  open,
  onClose,
  setShareModalOpen,
}: Props) => {
  return (
    <Modal opened={open} close={onClose} width="640px">
      <Box
        display="flex"
        flexDirection="column"
        px="30px"
        pt="10px"
        pb="30px"
        alignItems="flex-start"
      >
        <Text color="textSecondary" fontSize="s" mt="0">
          <FormattedMessage {...messages.shareAsWebLinkDesc} />
        </Text>

        <Button
          mr="8px"
          buttonStyle="primary"
          onClick={() => setShareModalOpen(false)}
          width="auto"
        >
          <FormattedMessage {...messages.printToPdf} />
        </Button>
        <Button
          mr="8px"
          buttonStyle="primary"
          onClick={() => clHistory.push('/admin/reporting/report-builder')}
          width="auto"
        >
          <FormattedMessage {...messages.printToPdf} />
        </Button>
      </Box>
    </Modal>
  );
};

export default QuitWithoutSavingModal;
