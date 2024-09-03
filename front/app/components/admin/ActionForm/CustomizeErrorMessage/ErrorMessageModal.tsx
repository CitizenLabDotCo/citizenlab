import React from 'react';

import { Box, Title } from '@citizenlab/cl2-component-library';

import Modal from 'components/UI/Modal';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  opened: boolean;
  onClose: () => void;
}

const ErrorMessageModal = ({ opened, onClose }: Props) => {
  return (
    <Modal
      opened={opened}
      close={onClose}
      niceHeader={true}
      header={
        <Title ml="20px" variant="h3" color="primary">
          <FormattedMessage {...messages.customizeErrorMessage} />
        </Title>
      }
      closeOnClickOutside={false}
      width={'550px'}
    >
      <Box m="20px">TODO content</Box>
    </Modal>
  );
};

export default ErrorMessageModal;
