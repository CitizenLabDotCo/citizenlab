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

import useFeatureFlag from 'hooks/useFeatureFlag';
import useLocalize from 'hooks/useLocalize';

import { adminProjectsProjectPath } from 'containers/Admin/projects/routes';
import messages from 'containers/ProjectsShowPage/messages';
import { maxPageWidth } from 'containers/ProjectsShowPage/styles';

import ContentContainer from 'components/ContentContainer';
import FollowUnfollow from 'components/FollowUnfollow';
import {
  HeaderImage,
  HeaderImageContainer,
} from 'components/ProjectableHeader';
import ContentViewer from 'components/ProjectDescriptionBuilder/ContentViewer';
import ButtonWithLink from 'components/UI/ButtonWithLink';

import { useIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';
import { canModerateProject } from 'utils/permissions/rules/projectPermissions';

import ProjectArchivedIndicator from './ProjectArchivedIndicator';
import ProjectFolderGoBackButton from './ProjectFolderGoBackButton';
import ProjectInfo from './ProjectInfo';
import ProjectPreviewIndicator from './ProjectPreviewIndicator';

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
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const projectDescriptionBuilderEnabled = useFeatureFlag({
    name: 'project_description_builder',
  });
  const isProjectFoldersEnabled = useFeatureFlag({ name: 'project_folders' });
  const { data: project } = useProjectById(projectId);
  const { data: authUser } = useAuthUser();
  const projectFolderId = project?.data.attributes.folder_id;

  if (project) {
    const projectHeaderImageLargeUrl = project.data.attributes.header_bg.large;
    const projectHeaderImageAltText = localize(
      project.data.attributes.header_bg_alt_text_multiloc
    );
    const userCanEditProject =
      !isNilOrError(authUser) && canModerateProject(project.data, authUser);

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
                // TODO: Fix this the next time the file is edited.
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                followerId={project.data.relationships.user_follower?.data?.id}
                py="6px"
                iconSize="20px"
                toolTipType="projectOrFolder"
              />
            </Box>
          </Box>
          {projectHeaderImageLargeUrl && (
            <HeaderImageContainer>
              <HeaderImage
                id="e2e-project-header-image"
                src={projectHeaderImageLargeUrl}
                cover={true}
                fadeIn={false}
                isLazy={false}
                placeholderBg="transparent"
                alt={projectHeaderImageAltText}
              />
            </HeaderImageContainer>
          )}
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
          {!projectDescriptionBuilderEnabled && (
            <ProjectInfo projectId={projectId} />
          )}
          <ContentViewer />
        </ContentContainer>
      </Container>
    );
  }

  return null;
});

export default ProjectHeader;
