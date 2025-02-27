import React from 'react';

import { Box, Button, Text, Title } from '@citizenlab/cl2-component-library';

import useDeleteSurveyResults from 'api/survey_results/useDeleteSurveyResults';

import Modal from 'components/UI/Modal';

type Props = {
  phaseId?: string;
  showDeleteModal: boolean;
  setShowDeleteModal: (show: boolean) => void;
};
const DeleteSubmissionsModal = ({
  phaseId,
  showDeleteModal,
  setShowDeleteModal,
}: Props) => {
  const { mutate: deleteFormResults } = useDeleteSurveyResults();

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
  };

  const deleteResults = () => {
    deleteFormResults(
      { phaseId },
      {
        onSuccess: () => {
          closeDeleteModal();
        },
      }
    );
  };

  return (
    <Modal opened={showDeleteModal} close={closeDeleteModal}>
      <Box display="flex" flexDirection="column" width="100%" p="20px">
        <Box mb="40px">
          <Title variant="h3" color="primary">
            delete Results title
          </Title>
          <Text color="primary" fontSize="l">
            delete results info
          </Text>
        </Box>
        <Box
          display="flex"
          flexDirection="row"
          width="100%"
          alignItems="center"
        >
          <Button
            icon="delete"
            data-cy="e2e-confirm-delete-survey-results"
            buttonStyle="delete"
            width="auto"
            mr="20px"
            onClick={deleteResults}
          >
            confirm delete button text
          </Button>
          <Button
            buttonStyle="secondary-outlined"
            width="auto"
            onClick={closeDeleteModal}
          >
            Can delete button text
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default DeleteSubmissionsModal;
