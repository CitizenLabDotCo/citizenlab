import React from 'react';

import { Box, Title } from '@citizenlab/cl2-component-library';

import Modal from 'components/UI/Modal';
import Warning from 'components/UI/Warning';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  opened: boolean;
  verificationMethodName: string;
  onClose: () => void;
}

const SSOConfigModal = ({ opened, verificationMethodName, onClose }: Props) => {
  return (
    <Modal
      opened={opened}
      close={onClose}
      niceHeader={true}
      header={
        <Title ml="20px" variant="h3" color="primary">
          <FormattedMessage
            {...messages.xVerification}
            values={{
              verificationMethod: verificationMethodName,
            }}
          />
        </Title>
      }
      closeOnClickOutside={false}
      width={'550px'}
    >
      <Box m="20px">
        <Warning>Test</Warning>
      </Box>
    </Modal>
  );
};

export default SSOConfigModal;
