import React, { useState } from 'react';

import {
  Box,
  stylingConsts,
  Text,
  Title,
  StatusLabel,
  colors,
} from '@citizenlab/cl2-component-library';
import { useFormContext } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

import usePhase from 'api/phases/usePhase';
import useProjectById from 'api/projects/useProjectById';

import useFeatureFlag from 'hooks/useFeatureFlag';
import useLocalize from 'hooks/useLocalize';

import {
  FormBuilderConfig,
  getIsPostingEnabled,
} from 'components/FormBuilder/utils';
import Button from 'components/UI/Button';
import GoBackButton from 'components/UI/GoBackButton';
import Modal from 'components/UI/Modal';

import { FormattedMessage } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

import messages from '../messages';

import ownMessages from './messages';

const StyledStatusLabel = styled(StatusLabel)`
  height: 20px;
  margin-bottom: auto;
`;

type FormBuilderTopBarProps = {
  isSubmitting: boolean;
  builderConfig: FormBuilderConfig;
};

const FormBuilderTopBar = ({
  isSubmitting,
  builderConfig,
}: FormBuilderTopBarProps) => {
  const printedFormsEnabled =
    useFeatureFlag({
      name: 'import_printed_forms',
    }) && builderConfig.onDownloadPDF;
  const localize = useLocalize();
  const { projectId, phaseId } = useParams() as {
    projectId: string;
    phaseId?: string;
  };
  const { data: project } = useProjectById(projectId);
  const { data: phase } = usePhase(phaseId || null);
  const {
    formState: { isDirty },
  } = useFormContext();

  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const closeModal = () => {
    setShowLeaveModal(false);
  };

  if (!project) {
    return null;
  }

  const isPostingEnabled = getIsPostingEnabled(phase?.data);
  const viewFormLink =
    builderConfig.viewFormLink ||
    `/projects/${project.data.attributes.slug}/ideas/new?phase_id=${phaseId}`;

  const handleGoback = () => {
    if (isDirty) {
      setShowLeaveModal(true);
    } else {
      clHistory.push(`/admin/projects/${projectId}`);
    }
  };

  return (
    <Box
      position="fixed"
      zIndex="3"
      alignItems="center"
      w="100%"
      h={`${stylingConsts.menuHeight}px`}
      display="flex"
      background={`${colors.white}`}
      borderBottom={`1px solid ${colors.borderLight}`}
      top="0px"
    >
      <Box
        p="16px"
        w="210px"
        h="100%"
        borderRight={`1px solid ${colors.borderLight}`}
        display="flex"
        alignItems="center"
      >
        <GoBackButton onClick={handleGoback} />
      </Box>
      <Box display="flex" p="16px" flexGrow={1} alignItems="center">
        <Box flexGrow={2}>
          <Text mb="0px" color="textSecondary">
            {localize(project.data.attributes.title_multiloc)}
          </Text>
          <Box display="flex" alignContent="center" mt="4px">
            <Title marginRight="8px" marginTop="0" variant="h4" as="h1">
              <FormattedMessage {...builderConfig.formBuilderTitle} />
            </Title>
            {builderConfig.showStatusBadge && (
              <StyledStatusLabel
                text={
                  isPostingEnabled ? (
                    <span style={{ color: colors.success }}>
                      <FormattedMessage {...messages.open} />
                    </span>
                  ) : (
                    <span style={{ color: colors.red400 }}>
                      <FormattedMessage {...messages.closed} />
                    </span>
                  )
                }
                backgroundColor={
                  isPostingEnabled ? colors.successLight : colors.errorLight
                }
              />
            )}
          </Box>
        </Box>
        {printedFormsEnabled && (
          <Button
            buttonStyle="secondary"
            icon="download"
            mr="20px"
            onClick={builderConfig.onDownloadPDF}
          >
            <FormattedMessage {...ownMessages.downloadPDF} />
          </Button>
        )}
        <Button
          buttonStyle="secondary"
          icon="eye"
          mr="20px"
          disabled={!project}
          linkTo={viewFormLink}
          openLinkInNewTab
          data-cy="e2e-preview-form-button"
        >
          <FormattedMessage {...builderConfig.viewFormLinkCopy} />
        </Button>
        <Button
          buttonStyle="admin-dark"
          processing={isSubmitting}
          type="submit"
        >
          <FormattedMessage {...messages.save} />
        </Button>
      </Box>
      <Modal opened={showLeaveModal} close={closeModal}>
        <Box display="flex" flexDirection="column" width="100%" p="20px">
          <Box mb="40px">
            <Title variant="h3" color="primary">
              <FormattedMessage
                {...messages.leaveBuilderConfirmationQuestion}
              />
            </Title>
            <Text color="primary" fontSize="l">
              <FormattedMessage {...messages.leaveBuilderText} />
            </Text>
          </Box>
          <Box
            display="flex"
            flexDirection="row"
            width="100%"
            alignItems="center"
          >
            <Button
              buttonStyle="secondary"
              width="100%"
              onClick={closeModal}
              mr="16px"
            >
              <FormattedMessage {...messages.cancelLeaveBuilderButtonText} />
            </Button>
            <Button
              buttonStyle="delete"
              width="100%"
              linkTo={`/admin/projects/${projectId}`}
            >
              <FormattedMessage {...messages.confirmLeaveBuilderButtonText} />
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default FormBuilderTopBar;
