import React from 'react';

import {
  Box,
  Title,
  Text,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';

import useAuthUser from 'api/me/useAuthUser';

import Button from 'components/UI/Button';
import Modal from 'components/UI/Modal';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../../messages';

interface Props {
  showLeaveModal: boolean;
  closeModal: () => void;
}

const LeaveConfirmationModal = ({ showLeaveModal, closeModal }: Props) => {
  const { slug: projectSlug } = useParams();

  const { data: authUser } = useAuthUser();
  const isSmallerThanPhone = useBreakpoint('phone');

  return (
    <Modal opened={showLeaveModal} close={closeModal}>
      <Box display="flex" flexDirection="column" width="100%" p="20px">
        <Box mb="40px">
          <Title variant="h3" color="primary">
            <FormattedMessage {...messages.leaveFormConfirmationQuestion} />
          </Title>
          <Text color="primary" fontSize="l">
            <FormattedMessage
              {...(authUser
                ? messages.leaveFormTextLoggedIn
                : messages.leaveSurveyText)}
            />
          </Text>
        </Box>
        <Box
          display="flex"
          flexDirection={isSmallerThanPhone ? 'column' : 'row'}
          width="100%"
          alignItems="center"
          gap="20px"
        >
          <Button buttonStyle="secondary" width="100%" onClick={closeModal}>
            <FormattedMessage {...messages.cancelLeaveSurveyButtonText} />
          </Button>
          <Button
            icon={authUser ? 'arrow-left-circle' : 'delete'}
            data-cy="e2e-confirm-delete-survey-results"
            buttonStyle={authUser ? 'primary' : 'delete'}
            width="100%"
            mb={isSmallerThanPhone ? '16px' : undefined}
            linkTo={`/projects/${projectSlug}`}
          >
            <FormattedMessage {...messages.confirmLeaveFormButtonText} />
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default LeaveConfirmationModal;
