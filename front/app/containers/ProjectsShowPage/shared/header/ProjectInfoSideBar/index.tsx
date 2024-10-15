import React, { memo } from 'react';

import { Box, media } from '@citizenlab/cl2-component-library';
import styled, { useTheme } from 'styled-components';

import useAuthUser from 'api/me/useAuthUser';
import useProjectById from 'api/projects/useProjectById';

import AvatarBubbles from 'components/AvatarBubbles';

import { isAdmin } from 'utils/permissions/roles';

import ProjectActionButtons from '../ProjectActionButtons';

const StyledProjectActionButtons = styled(ProjectActionButtons)`
  margin-top: 20px;

  ${media.tablet`
    margin-top: 30px;
  `}
`;

interface Props {
  projectId: string;
  hideParticipationAvatarsText?: boolean;
  className?: string;
}

const ProjectInfoSideBar = memo<Props>(
  ({ projectId, className, hideParticipationAvatarsText = false }) => {
    const { data: authUser } = useAuthUser();
    const { data: project } = useProjectById(projectId, !isAdmin(authUser));
    const theme = useTheme();

    if (project) {
      const avatarIds =
        project.data.relationships.avatars &&
        project.data.relationships.avatars.data
          ? project.data.relationships.avatars.data.map((avatar) => avatar.id)
          : [];

      return (
        <Box id="e2e-project-sidebar" className={className || ''}>
          <StyledProjectActionButtons projectId={projectId} />
          {!hideParticipationAvatarsText && avatarIds.length > 0 && (
            <Box my="8px" w="100%" display="flex" justifyContent="center">
              <AvatarBubbles
                size={32}
                limit={3}
                userCountBgColor={theme.colors.tenantPrimary}
                avatarIds={avatarIds}
                userCount={project.data.attributes.participants_count}
              />
            </Box>
          )}
        </Box>
      );
    }

    return null;
  }
);

export default ProjectInfoSideBar;
