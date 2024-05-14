import React, { useState, forwardRef, RefObject } from 'react';

import {
  Box,
  Title,
  Text,
  useBreakpoint,
  IconButton,
  colors,
} from '@citizenlab/cl2-component-library';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'react-router-dom';
import { RouteType } from 'routes';
import styled, { useTheme } from 'styled-components';

import ideasKeys from 'api/ideas/keys';
import { IProjectData } from 'api/projects/types';

import Button from 'components/UI/Button';
import Modal from 'components/UI/Modal';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { queryClient } from 'utils/cl-react-query/queryClient';

import messages from '../messages';

const StyledSurveyTitle = styled(Text)`
  text-overflow: ellipsis;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

type Props = {
  project: IProjectData;
  titleText: string | React.ReactNode;
  canUserEditProject: boolean;
  loggedIn?: boolean;
  percentageAnswered: number;
};

const SurveyHeading = forwardRef(
  (
    {
      project,
      titleText,
      canUserEditProject,
      loggedIn,
      percentageAnswered,
    }: Props,
    ref: RefObject<HTMLDivElement>
  ) => {
    const theme = useTheme();
    const { formatMessage } = useIntl();
    const [searchParams] = useSearchParams();
    const phaseId =
      searchParams.get('phase_id') ||
      project.relationships.current_phase?.data?.id;
    const linkToSurveyBuilder: RouteType = `/admin/projects/${project.id}/phases/${phaseId}/native-survey/edit`;
    const canEditSurvey = canUserEditProject;
    const isSmallerThanPhone = useBreakpoint('phone');
    const showEditSurveyButton = !isSmallerThanPhone && canEditSurvey;
    const modalPortalElement = document.getElementById('modal-portal');
    const [showLeaveModal, setShowLeaveModal] = useState(false);
    const openModal = () => {
      setShowLeaveModal(true);
    };
    const closeModal = () => {
      setShowLeaveModal(false);
    };

    return modalPortalElement
      ? createPortal(
          <Box
            display="flex"
            flexDirection="row"
            justifyContent="center"
            w="100%"
            zIndex="1010"
            position="fixed"
            borderRadius="2px"
            ref={ref}
          >
            <Box
              position="fixed"
              top={isSmallerThanPhone ? '0px' : '40px'}
              width="100%"
              bgColor={colors.white}
              display="flex"
              flexDirection="column"
              justifyContent="center"
              alignItems="center"
              zIndex="1010"
              maxWidth="700px"
            >
              <Box w="100%" background={colors.background}>
                <Box
                  w={`${percentageAnswered}%`}
                  h="4px"
                  background={theme.colors.tenantSecondary}
                  style={{ transition: 'width 0.3s ease-in-out' }}
                />
              </Box>
              <Box
                display="flex"
                width="100%"
                flexDirection="row"
                justifyContent={
                  showEditSurveyButton ? 'flex-end' : 'space-between'
                }
                alignItems="center"
                maxWidth="700px"
              >
                <Box
                  display="flex"
                  flexDirection="row"
                  width="100%"
                  alignItems="center"
                  justifyContent="space-between"
                  p={isSmallerThanPhone ? '14px 16px' : '14px 24px'}
                  borderBottom={`1px solid ${colors.divider}`}
                >
                  <StyledSurveyTitle
                    color={'tenantPrimary'}
                    variant="bodyS"
                    fontSize="m"
                    my="0px"
                    textAlign="left"
                  >
                    {titleText}
                  </StyledSurveyTitle>
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
                      a11y_buttonActionMessage={formatMessage(
                        messages.leaveSurvey
                      )}
                      p="0px"
                    />
                  </Box>
                </Box>
              </Box>

              <Modal opened={showLeaveModal} close={closeModal}>
                <Box
                  display="flex"
                  flexDirection="column"
                  width="100%"
                  p="20px"
                >
                  <Box mb="40px">
                    <Title variant="h3" color="primary">
                      <FormattedMessage
                        {...messages.leaveFormConfirmationQuestion}
                      />
                    </Title>
                    <Text color="primary" fontSize="l">
                      <FormattedMessage
                        {...(loggedIn
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
                    <Button
                      buttonStyle="secondary"
                      width="100%"
                      onClick={closeModal}
                    >
                      <FormattedMessage
                        {...messages.cancelLeaveSurveyButtonText}
                      />
                    </Button>
                    <Button
                      icon={loggedIn ? 'arrow-left-circle' : 'delete'}
                      data-cy="e2e-confirm-delete-survey-results"
                      buttonStyle={loggedIn ? 'primary' : 'delete'}
                      width="100%"
                      mb={isSmallerThanPhone ? '16px' : undefined}
                      linkTo={`/projects/${project.attributes.slug}`}
                      onClick={() => {
                        // We need to invalidate any previously cached draft idea.
                        // Invalidating the draft while "in" the survey (I.e. In the useUpdateIdea
                        // when survey page next/previous buttons clicked) causes issues.
                        // TODO: Find a better solution for this.
                        queryClient.invalidateQueries({
                          queryKey: ideasKeys.item({ id: phaseId }),
                        });
                      }}
                    >
                      <FormattedMessage
                        {...messages.confirmLeaveFormButtonText}
                      />
                    </Button>
                  </Box>
                </Box>
              </Modal>
            </Box>
          </Box>,
          modalPortalElement
        )
      : null;
  }
);

export default SurveyHeading;
