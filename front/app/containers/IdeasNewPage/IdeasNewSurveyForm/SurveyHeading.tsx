import React, { useState } from 'react';

import {
  Box,
  Title,
  Text,
  useBreakpoint,
  IconButton,
  colors,
} from '@citizenlab/cl2-component-library';
import { useSearchParams } from 'react-router-dom';

import { IProjectData } from 'api/projects/types';

import Button from 'components/UI/Button';
import Modal from 'components/UI/Modal';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import messages from '../messages';

type Props = {
  project: IProjectData;
  titleText: string | React.ReactNode;
  canUserEditProject: boolean;
  loggedIn?: boolean;
  percentageAnswered: number;
};

const SurveyHeading = ({
  project,
  titleText,
  canUserEditProject,
  loggedIn,
  percentageAnswered,
}: Props) => {
  const { formatMessage } = useIntl();
  const [searchParams] = useSearchParams();
  const phaseId =
    searchParams.get('phase_id') ||
    project.relationships.current_phase?.data?.id;
  const linkToSurveyBuilder = phaseId
    ? `/admin/projects/${project.id}/phases/${phaseId}/native-survey/edit`
    : `/admin/projects/${project.id}/native-survey/edit`;
  const canEditSurvey = canUserEditProject;
  const isSmallerThanPhone = useBreakpoint('phone');
  const showEditSurveyButton = !isSmallerThanPhone && canEditSurvey;
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const openModal = () => {
    setShowLeaveModal(true);
  };
  const closeModal = () => {
    setShowLeaveModal(false);
  };

  return (
    <>
      <Box
        width="100%"
        display="flex"
        flexDirection={isSmallerThanPhone ? 'row-reverse' : 'column'}
        justifyContent="center"
        alignItems="center"
        top={isSmallerThanPhone ? '0px' : undefined}
        zIndex="3"
      >
        <Box w="100%" background={colors.background}>
          <Box
            w={`${percentageAnswered}%`}
            h="4px"
            background={colors.textSecondary}
          />
        </Box>
        <Box
          display="flex"
          width="100%"
          flexDirection="row"
          justifyContent={showEditSurveyButton ? 'flex-end' : 'space-between'}
          alignItems="center"
          maxWidth="700px"
        >
          <Box
            display="flex"
            flexDirection="row"
            width="100%"
            alignItems="center"
            justifyContent="space-between"
            p="14px 24px"
            borderBottom={`1px solid ${colors.divider}`}
          >
            <Text color={'tenantPrimary'} variant="bodyS" fontSize="m">
              {titleText}
            </Text>
            <Box display="flex">
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
              <IconButton
                iconName="close"
                onClick={(event) => {
                  event?.preventDefault();
                  openModal();
                }}
                iconColor={colors.textSecondary}
                iconColorOnHover={colors.black}
                a11y_buttonActionMessage={formatMessage(messages.leaveSurvey)}
              />
            </Box>
          </Box>
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

export default SurveyHeading;
