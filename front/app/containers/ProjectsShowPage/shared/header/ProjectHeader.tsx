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
import { Box, useBreakpoint } from '@citizenlab/cl2-component-library';
import Topics from 'components/PostShowComponents/Topics';
import Areas from 'components/PostShowComponents/Areas';

// hooks
import useProjectById from 'api/projects/useProjectById';
import useAuthUser from 'api/me/useAuthUser';
import useFeatureFlag from 'hooks/useFeatureFlag';
import { useIntl } from 'utils/cl-intl';

// i18n
import messages from 'containers/ProjectsShowPage/messages';

// style
import styled, { useTheme } from 'styled-components';
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
  const theme = useTheme();
  const isSmallerThanPhone = useBreakpoint('phone');
  const projectDescriptionBuilderEnabled = useFeatureFlag({
    name: 'project_description_builder',
  });
  const isProjectFoldersEnabled = useFeatureFlag({ name: 'project_folders' });
  const { data: project } = useProjectById(projectId);
  const { data: authUser } = useAuthUser();
  const projectFolderId = project?.data.attributes.folder_id;

  if (project) {
    const topicIds = project.data.relationships.topics.data.map(
      (topic) => topic.id
    );
    const areaIds = project.data.relationships.areas.data.map(
      (area) => area.id
    );
    const projectHeaderImageLargeUrl =
      project.data.attributes?.header_bg?.large;
    const userCanEditProject =
      !isNilOrError(authUser) && canModerateProject(project.data.id, authUser);
    const rowDirection = theme.isRtl ? 'row-reverse' : 'row';

    return (
      <Container className={className || ''}>
        <ContentContainer maxWidth={maxPageWidth}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb="20px"
            flexDirection={isSmallerThanPhone ? 'column' : rowDirection}
          >
            {(projectFolderId || userCanEditProject) && (
              <Box w="100%" display="flex" justifyContent="space-between">
                {projectFolderId && isProjectFoldersEnabled && (
                  <ProjectFolderGoBackButton
                    projectFolderId={projectFolderId}
                  />
                )}
                <Box
                  mr={isSmallerThanPhone ? '0px' : '8px'}
                  ml="auto"
                  display="flex"
                >
                  {userCanEditProject && (
                    <EditButton
                      icon="edit"
                      linkTo={adminProjectsProjectPath(project.data.id)}
                      buttonStyle="secondary"
                      padding="6px 12px"
                    >
                      {formatMessage(messages.editProject)}
                    </EditButton>
                  )}
                </Box>
              </Box>
            )}
            <Box
              ml={isSmallerThanPhone ? '8px' : 'auto'}
              mt={isSmallerThanPhone ? '16px' : '0px'}
            >
              <FollowUnfollow
                followableType="projects"
                followableId={project.data.id}
                followersCount={project.data.attributes.followers_count}
                followerId={project.data.relationships.user_follower?.data?.id}
                py="6px"
                iconSize="20px"
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
          <Box my="16px">
            <Topics postType="initiative" postTopicIds={topicIds} showTitle />
            <Areas areaIds={areaIds} />
          </Box>
        </ContentContainer>
      </Container>
    );
  }

  return null;
});

export default ProjectHeader;
