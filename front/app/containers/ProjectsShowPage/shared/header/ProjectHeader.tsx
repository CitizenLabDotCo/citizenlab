import React, { memo } from 'react';

import { Box, media, isRtl } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useAuthUser from 'api/me/useAuthUser';
import useProjectById from 'api/projects/useProjectById';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { adminProjectsProjectPath } from 'containers/Admin/projects/routes';
import messages from 'containers/ProjectsShowPage/messages';
import { maxPageWidth } from 'containers/ProjectsShowPage/styles';

import ContentContainer from 'components/ContentContainer';
import FollowUnfollow from 'components/FollowUnfollow';
import Outlet from 'components/Outlet';
import {
  HeaderImage,
  HeaderImageContainer,
} from 'components/ProjectableHeader';
import ProjectArchivedIndicator from 'components/ProjectArchivedIndicator';
import Button from 'components/UI/Button';

import { useIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';
import { canModerateProject } from 'utils/permissions/rules/projectPermissions';

import ProjectFolderGoBackButton from './ProjectFolderGoBackButton';
import ProjectInfo from './ProjectInfo';

const Container = styled.div`
  padding-top: 30px;
  padding-bottom: 65px;
  background: #fff;
  position: relative;
  z-index: 2;

  ${media.phone`
    padding-top: 30px;
    padding-bottom: 35px;
  `}
`;

const EditButton = styled(Button)`
  display: table;

  ${isRtl`
    margin: 0 0 auto 10px;
  `}
`;

const StyledProjectArchivedIndicator = styled(ProjectArchivedIndicator)<{
  hasHeaderImage: boolean;
}>`
  margin-top: ${(props) => (props.hasHeaderImage ? '-20px' : '0px')};
  margin-bottom: 25px;

  ${media.tablet`
    display: none;
  `}
`;

interface Props {
  projectId: string;
  className?: string;
}

const ProjectHeader = memo<Props>(({ projectId, className }) => {
  const { formatMessage } = useIntl();
  const projectDescriptionBuilderEnabled = useFeatureFlag({
    name: 'project_description_builder',
  });
  const isProjectFoldersEnabled = useFeatureFlag({ name: 'project_folders' });
  const { data: project } = useProjectById(projectId);
  const { data: authUser } = useAuthUser();
  const projectFolderId = project?.data.attributes.folder_id;

  if (project) {
    const projectHeaderImageLargeUrl =
      project.data.attributes?.header_bg?.large;
    const userCanEditProject =
      !isNilOrError(authUser) && canModerateProject(project.data.id, authUser);

    return (
      <Container className={className || ''}>
        <ContentContainer maxWidth={maxPageWidth}>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            mb="20px"
          >
            {(projectFolderId || userCanEditProject) && (
              <Box
                w="100%"
                display="flex"
                justifyContent="center"
                alignItems="center"
              >
                {projectFolderId && isProjectFoldersEnabled && (
                  <ProjectFolderGoBackButton
                    projectFolderId={projectFolderId}
                  />
                )}
                <Box mr="8px" ml="auto" display="flex">
                  {userCanEditProject && (
                    <EditButton
                      icon="edit"
                      linkTo={adminProjectsProjectPath(project.data.id)}
                      buttonStyle="secondary-outlined"
                      padding="6px 12px"
                    >
                      {formatMessage(messages.editProject)}
                    </EditButton>
                  )}
                </Box>
              </Box>
            )}
            <Box ml="auto" mt="0px">
              <FollowUnfollow
                followableType="projects"
                followableId={project.data.id}
                followersCount={project.data.attributes.followers_count}
                followerId={project.data.relationships.user_follower?.data?.id}
                py="6px"
                iconSize="20px"
                toolTipType="projectOrFolder"
              />
            </Box>
          </Box>
          {projectHeaderImageLargeUrl && (
            <HeaderImageContainer id="e2e-project-header-image">
              <HeaderImage
                id="e2e-project-header-image"
                src={projectHeaderImageLargeUrl}
                cover={true}
                fadeIn={false}
                isLazy={false}
                placeholderBg="transparent"
                alt=""
              />
            </HeaderImageContainer>
          )}
          <StyledProjectArchivedIndicator
            projectId={projectId}
            hasHeaderImage={!!projectHeaderImageLargeUrl}
          />
          {!projectDescriptionBuilderEnabled && (
            <ProjectInfo projectId={projectId} />
          )}
          <Outlet id="app.ProjectsShowPage.shared.header.ProjectInfo.projectDescriptionBuilder" />
        </ContentContainer>
      </Container>
    );
  }

  return null;
});

export default ProjectHeader;
