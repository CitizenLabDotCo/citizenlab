import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import clHistory from 'utils/cl-router/history';

// Components
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

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// Types
import { IProjectData } from 'services/projects';

// Styles
import { colors } from 'utils/styleUtils';

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
  const phaseId =
    searchParams.get('phase_id') ||
    project.relationships.current_phase?.data?.id;
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
  let headingTextColor:
    | keyof typeof colors
    | 'tenantPrimary'
    | 'tenantSecondary'
    | 'tenantText' = 'tenantText';
  if (isSurveyOnMobile) {
    headingTextColor = 'white';
  } else if (isSurvey) {
    headingTextColor = 'primary';
  }

  return (
    <>
      <Box
        width="100%"
        display="flex"
        flexDirection={isSurveyOnMobile ? 'row-reverse' : 'column'}
        justifyContent="center"
        alignItems="center"
        background={isSurveyOnMobile ? colors.primary : undefined}
        pt={isSurveyOnMobile ? '0px' : '40px'}
        height={isSurveyOnMobile ? '64px' : undefined}
        position={isSurveyOnMobile ? 'fixed' : undefined}
        top={isSurveyOnMobile ? '0px' : undefined}
        zIndex="3"
      >
        {!isSmallerThanXlPhone && (
          <Box
            display="flex"
            width="100%"
            flexDirection="row"
            justifyContent={canEditSurvey ? 'flex-end' : 'space-between'}
            mb="14px"
            alignItems="center"
            maxWidth="700px"
            px="20px"
          >
            {isSurvey ? (
              <Box
                display="flex"
                flexDirection="row"
                alignItems="center"
                justifyContent="center"
              >
                {showEditSurveyButton && (
                  <Button
                    data-cy="e2e-edit-survey-link"
                    icon="edit"
                    linkTo={linkToSurveyBuilder}
                    buttonStyle="text"
                    textDecorationHover="underline"
                    hidden={!canUserEditProject}
                  >
                    <FormattedMessage {...messages.editSurvey} />
                  </Button>
                )}
                <Button
                  icon="close"
                  buttonStyle="text"
                  padding="0px"
                  onClick={openModal}
                />
              </Box>
            ) : (
              <GoBackButton insideModal={false} projectId={project.id} />
            )}
          </Box>
        )}

        <Box width="100%">
          <Text
            width="100%"
            color={headingTextColor}
            variant="bodyL"
            fontWeight="normal"
            fontSize={isSurveyOnMobile ? 'xl' : 'xxxxl'}
            my={isSurveyOnMobile ? undefined : '0px'}
          >
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
                <FormattedMessage {...messages.leaveSurveyText} />
              </Text>
            </Box>
            <Box
              display="flex"
              flexDirection={isSmallerThanXlPhone ? 'column' : 'row'}
              width="100%"
              alignItems="center"
            >
              <Button
                icon="delete"
                data-cy="e2e-confirm-delete-survey-results"
                buttonStyle="delete"
                width="100%"
                mb={isSmallerThanXlPhone ? '16px' : undefined}
                mr={!isSmallerThanXlPhone ? '20px' : undefined}
                onClick={() => {
                  clHistory.push(`/projects/${project.attributes.slug}`);
                }}
              >
                <FormattedMessage {...messages.confirmLeaveSurveyButtonText} />
              </Button>
              <Button buttonStyle="secondary" width="100%" onClick={closeModal}>
                <FormattedMessage {...messages.cancelLeaveSurveyButtonText} />
              </Button>
            </Box>
          </Box>
        </Modal>
      </Box>
      {isSurveyOnMobile && (
        <>
          <Box
            top="0px"
            zIndex="5"
            display="flex"
            flexDirection="row"
            position="fixed"
            height="64px"
            justifyContent="flex-end"
            width="100%"
          >
            <Button
              icon="close"
              buttonStyle="text"
              iconColor="white"
              onClick={openModal}
            />
          </Box>
          <Box mt={`${stylingConsts.menuHeight}px`} display="flex" />
        </>
      )}
    </>
  );
};
