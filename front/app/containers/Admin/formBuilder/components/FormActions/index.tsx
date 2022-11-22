import { darken } from 'polished';
import React, { useState } from 'react';
import { WrappedComponentProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';

// components
import { Box, Text, Title, Toggle } from '@citizenlab/cl2-component-library';
import T from 'components/T';
import Button from 'components/UI/Button';
import Modal from 'components/UI/Modal';
import DeleteFormResultsNotice from 'containers/Admin/formBuilder/components/DeleteFormResultsNotice';

// routing
import clHistory from 'utils/cl-router/history';

// i18n
import { Multiloc } from 'typings';
import messages from '../messages';

// utils
import { isNilOrError } from 'utils/helperUtils';

// hooks
import useFormSubmissionCount from 'hooks/useFormSubmissionCount';
import { useParams } from 'react-router-dom';

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
  const submissionCount = useFormSubmissionCount({
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

  if (!isNilOrError(submissionCount)) {
    const haveSubmissionsComeIn = submissionCount.totalSubmissions > 0;

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
            label={formatMessage(messages.openForResponses)}
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
            {formatMessage(messages.viewSurveyResults, {
              count: submissionCount.totalSubmissions,
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
            {formatMessage(messages.editSurveyContent)}
          </Button>
          <Button
            linkTo={viewFormLink}
            icon="eye"
            openLinkInNewTab
            buttonStyle="cl-blue"
            width="auto"
            minWidth="312px"
          >
            {formatMessage(messages.viewSurveyText)}
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
              {formatMessage(messages.deleteSurveyResults)}
            </Button>
          </Box>
        )}
        <Modal opened={showDeleteModal} close={closeModal}>
          <Box display="flex" flexDirection="column" width="100%" p="20px">
            <Box mb="40px">
              <Title variant="h3" color="primary">
                {formatMessage(messages.deleteResultsConfirmationQuestion)}
              </Title>
              <Text color="primary" fontSize="l">
                {formatMessage(messages.deleteResultsInfo)}
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
                {formatMessage(messages.confirmDeleteButtonText)}
              </Button>
              <Button buttonStyle="secondary" width="auto" onClick={closeModal}>
                {formatMessage(messages.cancelDeleteButtonText)}
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
