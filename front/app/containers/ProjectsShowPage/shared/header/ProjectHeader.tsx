import React, { memo } from 'react';

import { isNilOrError } from 'utils/helperUtils';
import { canModerateProject } from 'services/permissions/rules/projectPermissions';
import { adminProjectsProjectPath } from 'containers/Admin/projects/routes';

// components
import ContentContainer from 'components/ContentContainer';
import ProjectInfo from './ProjectInfo';
import ProjectArchivedIndicator from 'components/ProjectArchivedIndicator';
import Button from 'components/UI/Button';
import Outlet from 'components/Outlet';
import ProjectFolderGoBackButton from './ProjectFolderGoBackButton';
import {
  HeaderImage,
  HeaderImageContainer,
} from 'components/ProjectableHeader';
import FollowUnfollow from 'components/FollowUnfollow';
import { Box } from '@citizenlab/cl2-component-library';

// hooks
import useProjectById from 'api/projects/useProjectById';
import useAuthUser from 'api/me/useAuthUser';
import useFeatureFlag from 'hooks/useFeatureFlag';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { WrappedComponentProps } from 'react-intl';
import messages from 'containers/ProjectsShowPage/messages';

// style
import styled from 'styled-components';
import { media, isRtl } from 'utils/styleUtils';
import { maxPageWidth } from 'containers/ProjectsShowPage/styles';

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

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  ${isRtl`
    flex-direction: row-reverse;
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

const ProjectHeader = memo<Props & WrappedComponentProps>(
  ({ projectId, className, intl: { formatMessage } }) => {
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
        !isNilOrError(authUser) &&
        canModerateProject(project.data.id, authUser);

      return (
        <Container className={className || ''}>
          <ContentContainer maxWidth={maxPageWidth}>
            <TopBar>
              {(projectFolderId || userCanEditProject) && (
                <Box w="100%" display="flex" justifyContent="space-between">
                  {projectFolderId && isProjectFoldersEnabled && (
                    <ProjectFolderGoBackButton
                      projectFolderId={projectFolderId}
                    />
                  )}
                  <Box mr="8px" display="flex">
                    {userCanEditProject && (
                      <EditButton
                        icon="edit"
                        linkTo={adminProjectsProjectPath(project.data.id)}
                        buttonStyle="secondary"
                        padding="5px 8px"
                      >
                        {formatMessage(messages.editProject)}
                      </EditButton>
                    )}
                  </Box>
                </Box>
              )}
              <Box ml="auto">
                <FollowUnfollow
                  followableType="projects"
                  followableId={project.data.id}
                  followersCount={project.data.attributes.followers_count}
                  followerId={
                    project.data.relationships.user_follower?.data?.id
                  }
                  padding="5px 8px"
                />
              </Box>
            </TopBar>
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
              <>
                <ProjectInfo projectId={projectId} />
              </>
            )}
            <Outlet id="app.ProjectsShowPage.shared.header.ProjectInfo.projectDescriptionBuilder" />
          </ContentContainer>
        </Container>
      );
    }

    return null;
  }
);

export default injectIntl(ProjectHeader);
