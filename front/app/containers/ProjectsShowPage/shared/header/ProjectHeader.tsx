import React, { memo } from 'react';

import {
  Box,
  media,
  isRtl,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useAuthUser from 'api/me/useAuthUser';
import useProjectById from 'api/projects/useProjectById';

import { adminProjectsProjectLink } from 'containers/Admin/projects/routes';
import messages from 'containers/ProjectsShowPage/messages';
import { maxPageWidth } from 'containers/ProjectsShowPage/styles';

import ContentContainer from 'components/ContentContainer';
import FollowUnfollow from 'components/FollowUnfollow';
import ProjectPageContentViewer from 'components/ProjectPageBuilder/ContentViewer';
import ButtonWithLink from 'components/UI/ButtonWithLink';

import { useIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';
import { canModerateProject } from 'utils/permissions/rules/projectPermissions';

import ProjectArchivedIndicator from './ProjectArchivedIndicator';
import ProjectFolderGoBackButton from './ProjectFolderGoBackButton';
import ProjectPreviewIndicator from './ProjectPreviewIndicator';

const Container = styled.div`
  padding-top: 30px;
  padding-bottom: 0px;
  background: #fff;
  position: relative;
  z-index: 2;

  ${media.phone`
    padding-top: 30px;
  `}
`;

const EditButton = styled(ButtonWithLink)`
  display: table;

  ${isRtl`
    margin: 0 0 auto 10px;
  `}
`;

interface Props {
  projectId: string;
  className?: string;
}

const ProjectHeader = memo<Props>(({ projectId, className }) => {
  const isSmallerThanTablet = useBreakpoint('tablet');
  const isPhoneOrSmaller = useBreakpoint('phone');
  const { formatMessage } = useIntl();
  const { data: project } = useProjectById(projectId);
  const { data: authUser } = useAuthUser();
  const projectFolderId = project?.data.attributes.folder_id;

  if (project) {
    const projectHeaderImageLargeUrl = project.data.attributes.header_bg.large;
    const userCanEditProject =
      !isNilOrError(authUser) && canModerateProject(project.data, authUser);

    return (
      <Container className={className || ''}>
        <ContentContainer maxWidth={maxPageWidth}>
          <Box
            display="flex"
            flexWrap="wrap"
            justifyContent="center"
            alignItems="center"
            mb="20px"
          >
            {projectFolderId && (
              <Box
                w={isPhoneOrSmaller && userCanEditProject ? '100%' : 'auto'}
                display="flex"
                justifyContent="flex-start"
              >
                <ProjectFolderGoBackButton projectFolderId={projectFolderId} />
              </Box>
            )}
            <Box ml="auto" display="flex" alignItems="center">
              {userCanEditProject && (
                <Box mr="8px" display="flex">
                  <EditButton
                    icon="edit"
                    {...adminProjectsProjectLink(project.data.id)}
                    buttonStyle="secondary-outlined"
                    padding="6px 12px"
                  >
                    {formatMessage(messages.editProject)}
                  </EditButton>
                </Box>
              )}
              <FollowUnfollow
                followableType="projects"
                followableId={project.data.id}
                followersCount={project.data.attributes.followers_count}
                // TODO: Fix this the next time the file is edited.
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                followerId={project.data.relationships.user_follower?.data?.id}
                py="6px"
                iconSize="20px"
                toolTipType="projectOrFolder"
              />
            </Box>
          </Box>
          {!isSmallerThanTablet && (
            <ProjectArchivedIndicator
              projectId={projectId}
              mb="24px"
              mt={projectHeaderImageLargeUrl ? '-20px' : '0px'}
            />
          )}
          {!isSmallerThanTablet && (
            <ProjectPreviewIndicator
              projectId={projectId}
              mb="24px"
              mt={projectHeaderImageLargeUrl ? '-20px' : '0px'}
            />
          )}
          <ProjectPageContentViewer projectId={project.data.id} />
        </ContentContainer>
      </Container>
    );
  }

  return null;
});

export default ProjectHeader;
