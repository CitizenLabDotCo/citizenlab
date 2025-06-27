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
import { useLocation, useParams, useSearchParams } from 'react-router-dom';
import { RouteType } from 'routes';
import styled from 'styled-components';

import ideasKeys from 'api/ideas/keys';
import useAuthUser from 'api/me/useAuthUser';
import usePhase from 'api/phases/usePhase';
import useProjectBySlug from 'api/projects/useProjectBySlug';

import ButtonWithLink from 'components/UI/ButtonWithLink';
import Modal from 'components/UI/Modal';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { queryClient } from 'utils/cl-react-query/queryClient';
import clHistory from 'utils/cl-router/history';
import { canModerateProject } from 'utils/permissions/rules/projectPermissions';

import { getLeaveFormDestination } from '../utils';

import messages from './messages';

const StyledSurveyTitle = styled(Text)`
  text-overflow: ellipsis;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

type Props = {
  titleText: string | React.ReactNode;
  phaseId: string;
};

const SurveyHeading = ({ titleText, phaseId }: Props) => {
  const location = useLocation();

  const { slug: projectSlug } = useParams();
  const { data: project } = useProjectBySlug(projectSlug);
  const { data: phase } = usePhase(phaseId);
  const { data: authUser } = useAuthUser();

  const phaseParticipationMethod = phase?.data.attributes.participation_method;

  const { formatMessage } = useIntl();
  const isSmallerThanPhone = useBreakpoint('phone');
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const openModal = () => {
    setShowLeaveModal(true);
  };
  const closeModal = () => {
    setShowLeaveModal(false);
  };
  const [searchParams] = useSearchParams();

  const hasBeenSubmitted = !!searchParams.get('idea_id');

  if (!project) return null;

  const showEditSurveyButton =
    !isSmallerThanPhone && canModerateProject(project.data, authUser);
  const linkToSurveyBuilder: RouteType =
    phaseParticipationMethod === 'community_monitor_survey'
      ? `/admin/community-monitor/projects/${project.data.id}/phases/${phaseId}/survey/edit`
      : `/admin/projects/${project.data.id}/phases/${phaseId}/survey-form/edit`;

  const leaveForm = () => {
    const leaveFormDestination = getLeaveFormDestination(
      phaseParticipationMethod
    );

    switch (leaveFormDestination) {
      case 'go-back':
        // If there is a back history, go back, otherwise go to the homepage
        location.key !== 'default' ? clHistory.goBack() : clHistory.push('/');
        break;
      case 'project-page':
        clHistory.push(`/projects/${projectSlug}`);
        break;
      default:
        clHistory.push(`/projects/${projectSlug}`);
    }

    // We need to invalidate any previously cached draft idea.
    // Invalidating the draft while "in" the survey (I.e. In the useUpdateIdea
    // when survey page next/previous buttons clicked) causes issues.
    // TODO: Find a better solution for this.
    queryClient.invalidateQueries({
      queryKey: ideasKeys.item({ id: phaseId }),
    });
  };

  return (
    <>
      <Box
        bgColor={colors.white}
        display="flex"
        alignItems="center"
        // If we don't have an edit button, it still needs to look consistent
        minHeight={`${
          isSmallerThanPhone
            ? stylingConsts.mobileTopBarHeight
            : stylingConsts.menuHeight
        }px`}
        px="24px"
        borderBottom={`1px solid ${colors.divider}`}
      >
        <StyledSurveyTitle
          color={'tenantText'}
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
            <ButtonWithLink
              data-cy="e2e-edit-survey-link"
              icon="edit"
              linkTo={linkToSurveyBuilder}
              buttonStyle="primary-inverse"
              textDecorationHover="underline"
              mr="12px"
            >
              <FormattedMessage {...messages.editSurvey} />
            </ButtonWithLink>
          )}
          <IconButton
            iconName="close"
            onClick={(event) => {
              event?.preventDefault();

              if (hasBeenSubmitted) {
                leaveForm();
              } else {
                openModal();
              }
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
            <Title variant="h1" as="h3" color="primary">
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
            <ButtonWithLink
              buttonStyle="secondary-outlined"
              width="100%"
              onClick={closeModal}
            >
              <FormattedMessage {...messages.cancelLeaveSurveyButtonText} />
            </ButtonWithLink>
            <ButtonWithLink
              icon={authUser ? 'arrow-left-circle' : 'delete'}
              data-cy="e2e-confirm-delete-survey-results"
              buttonStyle={authUser ? 'primary' : 'delete'}
              width="100%"
              mb={isSmallerThanPhone ? '16px' : undefined}
              onClick={leaveForm}
            >
              <FormattedMessage {...messages.confirmLeaveFormButtonText} />
            </ButtonWithLink>
          </Box>
        </Box>
      </Modal>
    </>
  );
};

export default SurveyHeading;
