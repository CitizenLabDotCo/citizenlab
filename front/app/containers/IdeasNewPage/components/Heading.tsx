import React, { useState, useCallback } from 'react';

import {
  Box,
  Title,
  Text,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';
import { useSearchParams } from 'react-router-dom';

import { IProjectData } from 'api/projects/types';

import useLocalize from 'hooks/useLocalize';

import Button from 'components/UI/Button';
import GoBackButton from 'components/UI/GoBackButton';
import GoBackButtonSolid from 'components/UI/GoBackButton/GoBackButtonSolid';
import Modal from 'components/UI/Modal';

import { FormattedMessage } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

import messages from '../messages';

type Props = {
  project: IProjectData;
  titleText: string | React.ReactNode;
  isSurvey: boolean;
  canUserEditProject: boolean;
  loggedIn?: boolean;
};

export const Heading = ({
  project,
  titleText,
  canUserEditProject,
  isSurvey,
  loggedIn,
}: Props) => {
  const localize = useLocalize();
  const [searchParams] = useSearchParams();
  const phaseId =
    searchParams.get('phase_id') ||
    project.relationships.current_phase?.data?.id;
  const linkToSurveyBuilder = phaseId
    ? `/admin/projects/${project.id}/phases/${phaseId}/native-survey/edit`
    : `/admin/projects/${project.id}/native-survey/edit`;
  const canEditSurvey = canUserEditProject && isSurvey;
  const isSmallerThanPhone = useBreakpoint('phone');
  const showEditSurveyButton = !isSmallerThanPhone && canEditSurvey;
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const shouldCenterTopBarContent = !isSmallerThanPhone || !isSurvey;
  const openModal = () => {
    setShowLeaveModal(true);
  };
  const closeModal = () => {
    setShowLeaveModal(false);
  };
  const isSurveyOnMobile = isSmallerThanPhone && isSurvey;

  const goBackToProject = useCallback(() => {
    clHistory.push(`/projects/${project.attributes.slug}`);
  }, [project]);

  return (
    <>
      {isSurveyOnMobile && (
        <>
          <Box
            padding="20px"
            display="flex"
            justifyContent="flex-start"
            width="100%"
          >
            <GoBackButton onClick={openModal} />
          </Box>
        </>
      )}
      <Box
        width="100%"
        display="flex"
        flexDirection={isSurveyOnMobile ? 'row-reverse' : 'column'}
        justifyContent="center"
        alignItems="center"
        pt={isSurveyOnMobile ? '0px' : '40px'}
        top={isSurveyOnMobile ? '0px' : undefined}
        zIndex="3"
      >
        <Box
          display="flex"
          width={shouldCenterTopBarContent ? '100%' : undefined}
          flexDirection="row"
          justifyContent={showEditSurveyButton ? 'flex-end' : 'space-between'}
          mb="14px"
          alignItems="center"
          maxWidth="700px"
          px="20px"
        >
          {!isSurvey && (
            <GoBackButtonSolid
              text={localize(project.attributes.title_multiloc)}
              onClick={goBackToProject}
            />
          )}
          {isSurvey && !isSmallerThanPhone && (
            <Box
              display="flex"
              flexDirection="row"
              width="100%"
              alignItems="center"
              justifyContent="space-between"
            >
              <GoBackButton onClick={openModal} />
              {showEditSurveyButton && (
                <Button
                  data-cy="e2e-edit-survey-link"
                  icon="edit"
                  linkTo={linkToSurveyBuilder}
                  buttonStyle="primary-inverse"
                  textDecorationHover="underline"
                  hidden={!canUserEditProject}
                  mr="12px"
                >
                  <FormattedMessage {...messages.editSurvey} />
                </Button>
              )}
            </Box>
          )}
        </Box>

        <Box width="100%">
          <Text
            width="100%"
            color={'tenantPrimary'}
            variant="bodyL"
            style={{ fontWeight: isSurvey ? 600 : 500 }}
            fontSize={isSurveyOnMobile ? 'xxxl' : 'xxxxl'}
            ml={isSurveyOnMobile ? '16px' : '0px'}
            my={isSurveyOnMobile ? '12px' : '8px'}
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
                <FormattedMessage
                  {...(loggedIn
                    ? messages.leaveSurveyTextLoggedIn
                    : messages.leaveSurveyText)}
                />
              </Text>
            </Box>
            <Box
              display="flex"
              flexDirection={isSmallerThanPhone ? 'column' : 'row'}
              width="100%"
              alignItems="center"
            >
              <Button
                icon={loggedIn ? 'arrow-left-circle' : 'delete'}
                data-cy="e2e-confirm-delete-survey-results"
                buttonStyle={loggedIn ? 'primary' : 'delete'}
                width="100%"
                mb={isSmallerThanPhone ? '16px' : undefined}
                mr={!isSmallerThanPhone ? '20px' : undefined}
                linkTo={`/projects/${project.attributes.slug}`}
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
    </>
  );
};
