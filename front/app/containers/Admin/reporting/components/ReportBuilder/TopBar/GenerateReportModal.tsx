import React from 'react';

import { Box, Text, Title } from '@citizenlab/cl2-component-library';

import ButtonWithLink from 'components/UI/ButtonWithLink';
import Modal from 'components/UI/Modal';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  opened: boolean;
  reportIsEmpty: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const GenerateReportModal = ({
  opened,
  reportIsEmpty,
  onClose,
  onConfirm,
}: Props) => (
  <Modal opened={opened} close={onClose} ariaLabelledBy="generate-report-title">
    <Box display="flex" flexDirection="column" width="100%" p="20px">
      <Box mb="40px">
        <Title id="generate-report-title" variant="h3" color="primary">
          <FormattedMessage {...messages.generateReportConfirmationQuestion} />
        </Title>
        <Text color="primary" fontSize="l">
          <FormattedMessage
            {...(reportIsEmpty
              ? messages.generateReportInfo
              : messages.generateReportOverwriteInfo)}
          />
        </Text>
      </Box>
      <Box display="flex" flexDirection="row" width="100%" alignItems="center">
        <ButtonWithLink
          buttonStyle="secondary-outlined"
          width="auto"
          mr="16px"
          onClick={onClose}
        >
          <FormattedMessage {...messages.cancelGenerateButtonText} />
        </ButtonWithLink>
        <ButtonWithLink
          icon="stars"
          buttonStyle="primary"
          width="auto"
          onClick={onConfirm}
        >
          <FormattedMessage {...messages.confirmGenerateButtonText} />
        </ButtonWithLink>
      </Box>
    </Box>
  </Modal>
);

export default GenerateReportModal;
