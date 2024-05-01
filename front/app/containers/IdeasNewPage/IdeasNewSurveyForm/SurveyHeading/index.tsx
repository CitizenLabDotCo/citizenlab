import React, { useState } from 'react';

import {
  Box,
  Text,
  useBreakpoint,
  IconButton,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';
import { useSearchParams, useParams } from 'react-router-dom';
import { RouteType } from 'routes';
import styled from 'styled-components';

import useAuthUser from 'api/me/useAuthUser';
import useProjectBySlug from 'api/projects/useProjectBySlug';

import Button from 'components/UI/Button';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { canModerateProject } from 'utils/permissions/rules/projectPermissions';

import messages from '../../messages';

import LeaveConfirmationModal from './LeaveConfirmationModal';

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
      <Box bgColor={colors.white} display="flex" flexDirection="column">
        <Box
          display="flex"
          width="100%"
          justifyContent={'space-between'}
          alignItems="center"
          maxWidth="700px"
          minHeight={`${stylingConsts.menuHeight}px`}
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
      </Box>
      <LeaveConfirmationModal
        showLeaveModal={showLeaveModal}
        closeModal={closeModal}
      />
    </>
  );
};

export default SurveyHeading;
