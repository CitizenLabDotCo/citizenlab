import React, { memo } from 'react';

import {
  Box,
  colors,
  IconTooltip,
  media,
  Tooltip,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useAuthUser from 'api/me/useAuthUser';
import usePhases from 'api/phases/usePhases';
import useProjectById from 'api/projects/useProjectById';

import messages from 'containers/ProjectsShowPage/messages';

import AvatarBubbles from 'components/AvatarBubbles';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
import { isAdmin } from 'utils/permissions/roles';

import ProjectActionButtons from '../ProjectActionButtons';
import { hasNativeSurvey } from '../utils';

const StyledProjectActionButtons = styled(ProjectActionButtons)`
  margin-top: 20px;

  ${media.tablet`
    margin-top: 30px;
  `}
`;

interface Props {
  projectId: string;
  hideParticipationAvatars?: boolean;
  className?: string;
}

const ProjectInfoSideBar = memo<Props>(
  ({ projectId, className, hideParticipationAvatars = false }) => {
    const { data: authUser } = useAuthUser();
    const { data: project } = useProjectById(projectId, !isAdmin(authUser));
    const { data: phases } = usePhases(projectId);
    const { formatMessage } = useIntl();

    if (project) {
      const projectParticipantsCount =
        project.data.attributes.participants_count;
      const avatarIds =
        project.data.relationships.avatars &&
        project.data.relationships.avatars.data
          ? project.data.relationships.avatars.data.map((avatar) => avatar.id)
          : [];

      return (
        <Box id="e2e-project-sidebar" className={className || ''} w="100%">
          <StyledProjectActionButtons projectId={projectId} />
          {!hideParticipationAvatars && (
            <Box
              display="flex"
              alignItems="center"
              w="100%"
              justifyContent="center"
            >
              <Tooltip
                disabled={!isAdmin(authUser)}
                placement="bottom"
                content={formatMessage(messages.liveDataMessage)}
              >
                <Box
                  my="8px"
                  w="100%"
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                >
                  <AvatarBubbles
                    size={32}
                    limit={3}
                    avatarIds={avatarIds}
                    userCount={projectParticipantsCount}
                  />
                </Box>
              </Tooltip>
              {projectParticipantsCount > 0 &&
                isAdmin(authUser) &&
                hasNativeSurvey(phases?.data) && (
                  <Box ml="4px">
                    <IconTooltip
                      placement="auto"
                      maxTooltipWidth={200}
                      iconColor={colors.coolGrey500}
                      content={
                        <FormattedMessage
                          {...messages.participantsTooltip}
                          values={{
                            accessRightsLink: (
                              <Link
                                to={`/admin/projects/${projectId}/settings/access-rights`}
                              >
                                <FormattedMessage {...messages.accessRights} />
                              </Link>
                            ),
                          }}
                        />
                      }
                    />
                  </Box>
                )}
            </Box>
          )}
        </Box>
      );
    }

    return null;
  }
);

export default ProjectInfoSideBar;
