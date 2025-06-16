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
import { useParams, useSearchParams } from 'react-router-dom';
import { RouteType } from 'routes';
import styled from 'styled-components';

import useAuthUser from 'api/me/useAuthUser';
import useProjectBySlug from 'api/projects/useProjectBySlug';

import ButtonWithLink from 'components/UI/ButtonWithLink';
import Modal from 'components/UI/Modal';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import { canModerateProject } from 'utils/permissions/rules/projectPermissions';

import messages from '../messages';

const StyledTitle = styled(Text)`
  text-overflow: ellipsis;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

type Props = {
  phaseId: string;
  titleText?: string | React.ReactNode;
};

const NewIdeaHeading = ({ phaseId, titleText }: Props) => {
  const { slug: projectSlug } = useParams();
  const { data: project } = useProjectBySlug(projectSlug);
  const { data: authUser } = useAuthUser();

  const { formatMessage } = useIntl();
  const isSmallerThanPhone = useBreakpoint('phone');
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [searchParams] = useSearchParams();
  const ideaSubmitted = searchParams.get('idea_id') !== null;

  const openModal = () => {
    setShowLeaveModal(true);
  };
  const closeModal = () => {
    setShowLeaveModal(false);
  };

  if (!project) return null;

  const showEditFormButton =
    !isSmallerThanPhone && canModerateProject(project.data, authUser);
  const linkToFormBuilder: RouteType = `/admin/projects/${project.data.id}/phases/${phaseId}/form/edit`;

  const returnToProject = () => {
    clHistory.push(`/projects/${projectSlug}`);
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
        {titleText && (
          <StyledTitle
            color={'tenantText'}
            variant="bodyS"
            fontSize="m"
            my="0px"
            textAlign="left"
          >
            {titleText}
          </StyledTitle>
        )}
        <Box
          display="flex"
          // Pushes buttons to the right
          ml="auto"
        >
          {showEditFormButton && (
            <ButtonWithLink
              icon="edit"
              linkTo={linkToFormBuilder}
              buttonStyle="primary-inverse"
              textDecorationHover="underline"
              mr="12px"
            >
              <FormattedMessage {...messages.editForm} />
            </ButtonWithLink>
          )}
          <IconButton
            iconName="close"
            onClick={(event) => {
              event?.preventDefault();
              if (ideaSubmitted) {
                returnToProject();
              } else {
                openModal();
              }
            }}
            iconColor={colors.textSecondary}
            iconColorOnHover={colors.black}
            a11y_buttonActionMessage={formatMessage(messages.leaveIdeaForm)}
            p="0px"
            data-cy="e2e-leave-new-idea-button"
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
              <FormattedMessage {...messages.leaveIdeaText} />
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
              <FormattedMessage {...messages.cancelLeaveIdeaButtonText} />
            </ButtonWithLink>
            <ButtonWithLink
              icon={authUser ? 'arrow-left-circle' : 'delete'}
              buttonStyle={authUser ? 'primary' : 'delete'}
              width="100%"
              mb={isSmallerThanPhone ? '16px' : undefined}
              onClick={returnToProject}
              data-cy="e2e-confirm-leave-new-idea-button"
            >
              <FormattedMessage {...messages.confirmLeaveFormButtonText} />
            </ButtonWithLink>
          </Box>
        </Box>
      </Modal>
    </>
  );
};

export default NewIdeaHeading;
