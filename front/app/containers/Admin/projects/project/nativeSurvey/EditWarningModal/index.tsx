import React from 'react';

// intl
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

// components
import {
  Text,
  Box,
  Button,
  colors,
  Icon,
} from '@citizenlab/cl2-component-library';
import Modal from 'components/UI/Modal';

// routing
import clHistory from 'utils/cl-router/history';

type Props = {
  showEditWarningModal: boolean;
  setShowEditWarningModal: (show: boolean) => void;
  editFormLink: string;
  handleDownloadResults: () => void;
};

const EditWarningModal = ({
  showEditWarningModal,
  setShowEditWarningModal,
  editFormLink,
  handleDownloadResults,
}: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Modal
      width={520}
      opened={showEditWarningModal}
      close={() => {
        setShowEditWarningModal(false);
      }}
      header={formatMessage(messages.title)}
    >
      <Box m="24px">
        <Box mb="32px" display="flex">
          <Text m="0px" fontSize="s">
            {formatMessage(messages.loseDataWarning)}
            <span
              role="button"
              onClick={handleDownloadResults}
              style={{ textDecoration: 'underline', cursor: 'pointer' }}
            >
              {formatMessage(messages.exportYouResponses)}
            </span>
          </Text>
        </Box>

        <Box display="flex">
          <Box my="auto" mr="24px">
            <Icon name="minus-circle" fill={colors.error} />
          </Box>
          <Box>
            <Text m="0px" mb="8px" fontWeight="bold">
              {formatMessage(messages.deteleAQuestion)}
            </Text>
            <Text m="0px" fontSize="s">
              {formatMessage(messages.deleteAQuestionDescription)}
            </Text>
          </Box>
        </Box>

        <Box mt="32px" display="flex">
          <Box my="auto" mr="24px">
            <Icon name="alert-octagon" />
          </Box>
          <Box>
            <Text m="0px" mb="8px" fontWeight="bold">
              {formatMessage(messages.addOrReorder)}
            </Text>
            <Text m="0px" fontSize="s">
              {formatMessage(messages.addOrReorderDescription)}
            </Text>
          </Box>
        </Box>

        <Box mt="32px" display="flex">
          <Box my="auto" mr="24px">
            <Icon name="check-circle" fill={colors.success} />
          </Box>
          <Box>
            <Text m="0px" mb="8px" fontWeight="bold">
              {formatMessage(messages.changeQuestionText)}
            </Text>
            <Text m="0px" fontSize="s">
              {formatMessage(messages.changeQuestionTextDescription)}
            </Text>
          </Box>
        </Box>

        <Box mt="40px" display="flex" justifyContent="space-between">
          <Button
            p="0px"
            m="0px"
            buttonStyle="text"
            onClick={() => {
              setShowEditWarningModal(false);
            }}
          >
            {formatMessage(messages.noCancel)}
          </Button>
          <Button
            bgColor={colors.error}
            onClick={() => {
              clHistory.push(editFormLink);
            }}
          >
            {formatMessage(messages.yesContinue)}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default EditWarningModal;
