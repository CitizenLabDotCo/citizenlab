import React, { useState } from 'react';
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import { darken } from 'polished';

// components
import { Toggle, Box, Title, Text } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';
import T from 'components/T';
import Modal from 'components/UI/Modal';
import DeleteFormResultsNotice from 'containers/Admin/formBuilder/components/DeleteFormResultsNotice';

// routing
import clHistory from 'utils/cl-router/history';

// i18n
import messages from '../messages';
import { Multiloc } from 'typings';

// utils
import { isNilOrError } from 'utils/helperUtils';

// hooks
import { useParams } from 'react-router-dom';
import useFormSubmissionCount from 'hooks/useFormSubmissionCount';

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
} & InjectedIntlProps;

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
    const isEditingDisabled = submissionCount.totalSubmissions > 0;

    return (
      <Box width="100%" my="60px">
        <Box display="flex" flexDirection="row" width="100%" mb="48px">
          <Box width="100%">
            <Title variant="h4">
              <T value={heading} />
            </Title>
          </Box>
          <Box
            width="100%"
            display="flex"
            alignItems="center"
            justifyContent="flex-end"
          >
            <Toggle
              checked={postingEnabled}
              label={formatMessage(messages.openForSubmissions)}
              onChange={() => {
                togglePostingEnabled();
              }}
            />
          </Box>
        </Box>
        {isEditingDisabled && (
          <Box width="100%" mb="48px">
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
            buttonStyle="primary"
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
            buttonStyle="primary"
            width="auto"
            minWidth="312px"
            disabled={isEditingDisabled}
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
            buttonStyle="primary"
            width="auto"
            minWidth="312px"
          >
            {formatMessage(messages.viewSurveyText)}
          </Button>
        </Box>
        <Box
          display="flex"
          alignItems="flex-start"
          flexDirection="row"
          width="100%"
          justifyContent="space-between"
          mt="32px"
        >
          <Button
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
