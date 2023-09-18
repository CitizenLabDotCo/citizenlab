import React, { useState } from 'react';
import { WrappedComponentProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import { darken } from 'polished';

// components
import { Toggle, Box, Title, Text } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';
import T from 'components/T';
import Modal from 'components/UI/Modal';
import DeleteFormResultsNotice from '../DeleteFormResultsNotice';

// routing
import clHistory from 'utils/cl-router/history';

// i18n
import messages from '../messages';
import { Multiloc } from 'typings';

// utils

// hooks
import { useParams } from 'react-router-dom';
import useFormSubmissionCount from 'api/submission_count/useSubmissionCount';

// styles
import { colors } from 'utils/styleUtils';

// services
import { deleteFormResults } from 'services/formCustomFields';

type FormActionsProps = {
  phaseId?: string;
  editFormLink: string;
  viewFormLink: string;
  viewFormResults: string;
  postingEnabled: boolean;
  heading?: Multiloc;
  togglePostingEnabled: () => void;
} & WrappedComponentProps;

const FormActions = ({
  phaseId,
  intl: { formatMessage },
  viewFormLink,
  editFormLink,
  viewFormResults,
  heading,
  postingEnabled,
  togglePostingEnabled,
}: FormActionsProps) => {
  const { projectId } = useParams() as {
    projectId: string;
  };
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { data: submissionCount } = useFormSubmissionCount({
    projectId,
    phaseId,
  });
  const closeModal = () => {
    setShowDeleteModal(false);
  };
  const openModal = () => {
    setShowDeleteModal(true);
  };
  const deleteResults = async () => {
    await deleteFormResults(projectId, phaseId);
    closeModal();
  };

  if (submissionCount) {
    const haveSubmissionsComeIn =
      submissionCount.data.attributes.totalSubmissions > 0;

    return (
      <Box width="100%" my="60px">
        <Box
          display="flex"
          flexDirection="row"
          width="100%"
          mb="36px"
          gap="16px"
        >
          {heading && (
            <Title variant="h4" mt="0" mb="0">
              <T value={heading} />
            </Title>
          )}
          <Toggle
            checked={postingEnabled}
            label={formatMessage(messages.openForResponses2)}
            onChange={() => {
              togglePostingEnabled();
            }}
          />
        </Box>
        {haveSubmissionsComeIn && (
          <Box width="100%" mb="36px">
            <DeleteFormResultsNotice projectId={projectId} />
          </Box>
        )}
        <Box
          display="flex"
          alignItems="center"
          flexDirection="row"
          width="100%"
          justifyContent="space-between"
          gap="12px"
        >
          <Button
            icon="chart-bar"
            data-cy="e2e-form-view-results"
            buttonStyle="cl-blue"
            width="auto"
            minWidth="312px"
            onClick={() => {
              clHistory.push(viewFormResults);
            }}
          >
            {formatMessage(messages.viewSurveyResults2, {
              count: submissionCount.data.attributes.totalSubmissions,
            })}
          </Button>
          <Button
            icon="edit"
            buttonStyle="cl-blue"
            width="auto"
            minWidth="312px"
            disabled={haveSubmissionsComeIn}
            onClick={() => {
              clHistory.push(editFormLink);
            }}
            data-cy="e2e-edit-survey-content"
          >
            {formatMessage(messages.editSurveyContent2)}
          </Button>
          <Button
            linkTo={viewFormLink}
            icon="eye"
            openLinkInNewTab
            buttonStyle="cl-blue"
            width="auto"
            minWidth="312px"
          >
            {formatMessage(messages.viewSurveyText2)}
          </Button>
        </Box>
        {haveSubmissionsComeIn && (
          <Box
            display="flex"
            alignItems="flex-start"
            flexDirection="row"
            width="100%"
            justifyContent="space-between"
            mt="32px"
          >
            <Button
              data-cy="e2e-delete-survey-results"
              icon="delete"
              width="auto"
              minWidth="312px"
              bgColor="transparent"
              borderColor={colors.red600}
              iconColor={colors.red600}
              textColor={colors.red600}
              bgHoverColor={darken(0.12, colors.red600)}
              onClick={openModal}
            >
              {formatMessage(messages.deleteSurveyResults2)}
            </Button>
          </Box>
        )}
        <Modal opened={showDeleteModal} close={closeModal}>
          <Box display="flex" flexDirection="column" width="100%" p="20px">
            <Box mb="40px">
              <Title variant="h3" color="primary">
                {formatMessage(messages.deleteResultsConfirmationQuestion2)}
              </Title>
              <Text color="primary" fontSize="l">
                {formatMessage(messages.deleteResultsInfo2)}
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
                {formatMessage(messages.confirmDeleteButtonText2)}
              </Button>
              <Button buttonStyle="secondary" width="auto" onClick={closeModal}>
                {formatMessage(messages.cancelDeleteButtonText2)}
              </Button>
            </Box>
          </Box>
        </Modal>
      </Box>
    );
  }
  return null;
};

export default injectIntl(FormActions);
