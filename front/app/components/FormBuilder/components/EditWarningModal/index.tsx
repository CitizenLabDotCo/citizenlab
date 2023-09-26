import Modal from 'components/UI/Modal';
import React from 'react';
import { useIntl } from 'utils/cl-intl';
import messages from './messages';
import {
  Text,
  Box,
  Button,
  colors,
  Icon,
} from '@citizenlab/cl2-component-library';

const EditWarningModal = () => {
  const { formatMessage } = useIntl();

  return (
    <Modal
      width={560}
      opened={true}
      close={() => {
        console.log('closed');
      }}
      header={formatMessage(messages.title)}
    >
      <Box m="24px">
        <Text mb="24px">{formatMessage(messages.loseDataWarning)}</Text>

        <Box display="flex">
          <Box my="auto" mr="24px">
            <Icon name="delete" />
          </Box>
          <Box>
            <Text m="0px" mb="8px" fontWeight="bold">
              Delete a question
            </Text>
            <Text m="0px">
              You will lose response data linked to that question
            </Text>
          </Box>
        </Box>

        <Box mt="32px" display="flex">
          <Box my="auto" mr="24px">
            <Icon name="delete" />
          </Box>
          <Box>
            <Text m="0px" mb="8px" fontWeight="bold">
              Delete a question
            </Text>
            <Text m="0px">
              You will lose response data linked to that question
            </Text>
          </Box>
        </Box>

        <Box mt="32px" display="flex">
          <Box my="auto" mr="24px">
            <Icon name="delete" />
          </Box>
          <Box>
            <Text m="0px" mb="8px" fontWeight="bold">
              Delete a question
            </Text>
            <Text m="0px">
              You will lose response data linked to that question
            </Text>
          </Box>
        </Box>

        <Box mt="40px" display="flex" justifyContent="space-between">
          <Button pl="0px" buttonStyle="text">
            No, cancel
          </Button>
          <Button bgColor={colors.error}>Yes, change it</Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default EditWarningModal;
