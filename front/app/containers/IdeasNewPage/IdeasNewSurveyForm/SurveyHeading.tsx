import React, { useState } from 'react';

import {
  Box,
  Text,
  useBreakpoint,
  IconButton,
  colors,
  stylingConsts,
  Title,
} from '@citizenlab/cl2-component-library';
import { useSearchParams, useParams } from 'react-router-dom';
import { RouteType } from 'routes';
import styled from 'styled-components';

import useAuthUser from 'api/me/useAuthUser';
import useProjectBySlug from 'api/projects/useProjectBySlug';

import Button from 'components/UI/Button';
import Modal from 'components/UI/Modal';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { canModerateProject } from 'utils/permissions/rules/projectPermissions';

import messages from '../messages';

const StyledSurveyTitle = styled(Text)`
  text-overflow: ellipsis;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

type Props = {
  titleText: string | React.ReactNode;
};

const SurveyHeading = ({ titleText }: Props) => {
  const { slug: projectSlug } = useParams();
  const { data: project } = useProjectBySlug(projectSlug);
  const { data: authUser } = useAuthUser();

  const { formatMessage } = useIntl();
  const [searchParams] = useSearchParams();
  const isSmallerThanPhone = useBreakpoint('phone');
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const openModal = () => {
    setShowLeaveModal(true);
  };
  const closeModal = () => {
    setShowLeaveModal(false);
  };

  if (!project) return null;

  const showEditSurveyButton =
    !isSmallerThanPhone && canModerateProject(project.data.id, authUser);
  const phaseId =
    searchParams.get('phase_id') ||
    project.data.relationships.current_phase?.data?.id;
  const linkToSurveyBuilder: RouteType = `/admin/projects/${project.data.id}/phases/${phaseId}/native-survey/edit`;

  return (
    <>
      <Box
        bgColor={colors.white}
        display="flex"
        alignItems="center"
        // If we don't have an edit button, it still needs to look consistent
        minHeight={`${stylingConsts.menuHeight}px`}
        px="24px"
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
        <Box
          display="flex"
          // Pushes buttons to the right
          ml="auto"
        >
          {showEditSurveyButton && (
            <Button
              data-cy="e2e-edit-survey-link"
              icon="edit"
              linkTo={linkToSurveyBuilder}
              buttonStyle="primary-inverse"
              textDecorationHover="underline"
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
            p="0px"
          />
        </Box>
      </Box>
      <Modal opened={showLeaveModal} close={closeModal}>
        <Box display="flex" flexDirection="column" width="100%" p="20px">
          <Box mb="40px">
            <Title as="h1" variant="h3" color="primary">
              <FormattedMessage {...messages.leaveFormConfirmationQuestion} />
            </Title>
            <Text color="primary" fontSize="l">
              <FormattedMessage
                {...(authUser
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
            <Button buttonStyle="secondary" width="100%" onClick={closeModal}>
              <FormattedMessage {...messages.cancelLeaveSurveyButtonText} />
            </Button>
            <Button
              icon={authUser ? 'arrow-left-circle' : 'delete'}
              data-cy="e2e-confirm-delete-survey-results"
              buttonStyle={authUser ? 'primary' : 'delete'}
              width="100%"
              mb={isSmallerThanPhone ? '16px' : undefined}
              linkTo={`/projects/${projectSlug}`}
            >
              <FormattedMessage {...messages.confirmLeaveFormButtonText} />
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
};

export default SurveyHeading;
