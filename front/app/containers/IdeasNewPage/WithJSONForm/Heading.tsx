import React, { useState } from 'react';
import clHistory from 'utils/cl-router/history';

import messages from '../messages';

import GoBackButton from 'containers/IdeasShow/GoBackButton';
import {
  Box,
  Title,
  Text,
  stylingConsts,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';
import Modal from 'components/UI/Modal';
import { FormattedMessage } from 'utils/cl-intl';
import { colors } from 'utils/styleUtils';
import { IProjectData } from 'services/projects';
import { useSearchParams } from 'react-router-dom';

type Props = {
  project: IProjectData;
  titleText: string;
  isSurvey: boolean;
  canUserEditProject: boolean;
};

export const Heading = ({
  project,
  titleText,
  canUserEditProject,
  isSurvey,
}: Props) => {
  const [searchParams] = useSearchParams();
  const phaseId = searchParams.get('phase_id');
  const linkToSurveyBuilder = phaseId
    ? `/admin/projects/${project.id}/phases/${phaseId}/native-survey/edit`
    : `/admin/projects/${project.id}/native-survey/edit`;
  const canEditSurvey = canUserEditProject && isSurvey;
  const isSmallerThanXlPhone = useBreakpoint('phone');
  const showEditSurveyButton = !isSmallerThanXlPhone && canEditSurvey;
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const openModal = () => {
    setShowLeaveModal(true);
  };
  const closeModal = () => {
    setShowLeaveModal(false);
  };
  const isSurveyOnMobile = isSmallerThanXlPhone && isSurvey;

  return (
    <>
      <Box
        width="100%"
        display="flex"
        flexDirection={isSmallerThanXlPhone ? 'row-reverse' : 'column'}
        justifyContent="center"
        alignItems="center"
        background={isSurveyOnMobile ? colors.primary : undefined}
        pt={isSmallerThanXlPhone ? '0px' : '60px'}
        pb={isSmallerThanXlPhone ? '0px' : '40px'}
        mb={isSmallerThanXlPhone ? '20px' : '0px'}
        height={isSmallerThanXlPhone ? '64px' : undefined}
        position={isSmallerThanXlPhone ? 'fixed' : undefined}
        top={isSmallerThanXlPhone ? '0px' : undefined}
        zIndex="3"
      >
        <Box
          display="flex"
          width={isSmallerThanXlPhone ? undefined : '100%'}
          flexDirection="row"
          justifyContent={canEditSurvey ? 'flex-end' : 'space-between'}
          mb={isSurveyOnMobile ? '0px' : '14px'}
          alignItems="center"
          maxWidth="700px"
          px="20px"
        >
          {isSurvey ? (
            <Box
              data-cy="e2e-edit-survey-link"
              display="flex"
              flexDirection="row"
              alignItems="center"
              justifyContent="center"
            >
              {showEditSurveyButton && (
                <Button
                  icon="edit"
                  linkTo={linkToSurveyBuilder}
                  buttonStyle="text"
                  textDecorationHover="underline"
                  hidden={!canUserEditProject}
                  padding="0"
                >
                  <FormattedMessage {...messages.editSurvey} />
                </Button>
              )}
              <Button
                icon="close"
                buttonStyle="text"
                iconColor={isSurveyOnMobile ? 'white' : undefined}
                onClick={openModal}
              />
            </Box>
          ) : (
            <GoBackButton insideModal={false} projectId={project.id} />
          )}
        </Box>

        <Box width="100%">
          <Text color={isSurveyOnMobile ? 'white' : undefined}>
            {titleText}
          </Text>
        </Box>
        <Modal opened={showLeaveModal} close={closeModal}>
          <Box display="flex" flexDirection="column" width="100%" p="20px">
            <Box mb="40px">
              <Title variant="h3" color="primary">
                <FormattedMessage
                  {...messages.leaveSurveyConfirmationQuestion}
                />
              </Title>
              <Text color="primary" fontSize="l">
                <FormattedMessage {...messages.leaveSurveyMessage} />
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
                onClick={() => {
                  clHistory.push(`/projects/${project.attributes.slug}`);
                }}
              >
                <FormattedMessage {...messages.confirmLeaveSurveyButtonText} />
              </Button>
              <Button buttonStyle="secondary" width="auto" onClick={closeModal}>
                <FormattedMessage {...messages.cancelLeaveSurveyButtonText} />
              </Button>
            </Box>
          </Box>
        </Modal>
      </Box>
      <Box mt={`${stylingConsts.menuHeight}px`} display="flex" />
    </>
  );
};
