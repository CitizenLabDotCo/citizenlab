import React from 'react';

// components
import { Box, Text, Title } from '@citizenlab/cl2-component-library';

import ButtonWithLink from 'components/UI/ButtonWithLink';
import Modal from 'components/UI/Modal';

// i18n
import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  open: boolean;
  onCloseModal: () => void;
  onGoBack: () => void;
}

const QuitModal = ({ open, onCloseModal, onGoBack }: Props) => {
  return (
    <Modal opened={open} close={onCloseModal}>
      <Box display="flex" flexDirection="column" width="100%" p="20px">
        <Box mb="40px">
          <Title variant="h3" color="primary">
            <FormattedMessage {...messages.quitReportConfirmationQuestion} />
          </Title>
          <Text color="primary" fontSize="l">
            <FormattedMessage {...messages.quitReportInfo} />
          </Text>
        </Box>
        <Box
          display="flex"
          flexDirection="row"
          width="100%"
          alignItems="center"
        >
          <ButtonWithLink
            buttonStyle="secondary-outlined"
            width="auto"
            mr="16px"
            onClick={onCloseModal}
          >
            <FormattedMessage {...messages.cancelQuitButtonText} />
          </ButtonWithLink>
          <ButtonWithLink
            icon="delete"
            data-cy="e2e-confirm-delete-survey-results"
            buttonStyle="delete"
            width="auto"
            onClick={onGoBack}
          >
            <FormattedMessage {...messages.confirmQuitButtonText} />
          </ButtonWithLink>
        </Box>
      </Box>
    </Modal>
  );
};

export default QuitModal;
