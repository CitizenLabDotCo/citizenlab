import React, { useState, memo } from 'react';
import { WrappedComponentProps } from 'react-intl';
// style
import styled from 'styled-components';
import useAuthUser from 'hooks/useAuthUser';
import useFeatureFlag from 'hooks/useFeatureFlag';
// hooks
import useProject from 'hooks/useProject';
import { canModerateProject } from 'services/permissions/rules/projectPermissions';
// i18n
import { injectIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';
import { media, isRtl } from 'utils/styleUtils';
import { adminProjectsProjectPath } from 'containers/Admin/projects/routes';
import messages from 'containers/ProjectsShowPage/messages';
import { maxPageWidth } from 'containers/ProjectsShowPage/styles';
// components
import ContentContainer from 'components/ContentContainer';
import Outlet from 'components/Outlet';
import ProjectArchivedIndicator from 'components/ProjectArchivedIndicator';
import Button from 'components/UI/Button';
import Image from 'components/UI/Image';
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
  margin: 0 0 10px auto;

  ${isRtl`
    margin: 0 0 auto 10px;
  `}
`;

const HeaderImage = styled(Image)`
  width: 100%;
  height: 240px;
  margin-bottom: 30px;
  border-radius: ${(props: any) => props.theme.borderRadius};
  overflow: hidden;

  ${media.phone`
    height: 160px;
    margin-bottom: 20px;
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
    const [moduleActive, setModuleActive] = useState(false);
    const isProjectFoldersEnabled = useFeatureFlag({ name: 'project_folders' });
    const project = useProject({ projectId });
    const authUser = useAuthUser();
    const projectFolderId = project?.attributes.folder_id;

    if (!isNilOrError(project)) {
      const projectHeaderImageLargeUrl = project?.attributes?.header_bg?.large;
      const userCanEditProject =
        !isNilOrError(authUser) &&
        canModerateProject(project.id, { data: authUser });

      const setModuleToActive = () => setModuleActive(true);

      return (
        <Container className={className || ''}>
          <ContentContainer maxWidth={maxPageWidth}>
            {(projectFolderId || userCanEditProject) && (
              <TopBar>
                {projectFolderId && isProjectFoldersEnabled && (
                  <ProjectFolderGoBackButton
                    projectFolderId={projectFolderId}
                  />
                )}
                {userCanEditProject && (
                  <EditButton
                    icon="edit"
                    linkTo={adminProjectsProjectPath(project.id)}
                    buttonStyle="secondary"
                    padding="5px 8px"
                  >
                    {formatMessage(messages.editProject)}
                  </EditButton>
                )}
              </TopBar>
            )}
            {projectHeaderImageLargeUrl && (
              <HeaderImage
                id="e2e-project-header-image"
                src={projectHeaderImageLargeUrl}
                cover={true}
                fadeIn={false}
                isLazy={false}
                placeholderBg="transparent"
                alt=""
              />
            )}
            <StyledProjectArchivedIndicator
              projectId={projectId}
              hasHeaderImage={!!projectHeaderImageLargeUrl}
            />
            {!moduleActive && <ProjectInfo projectId={projectId} />}
            <Outlet
              id="app.ProjectsShowPage.shared.header.ProjectInfo.contentBuilder"
              onMount={setModuleToActive}
            />
          </ContentContainer>
        </Container>
      );
    }

    return null;
  }
);

export default injectIntl(ProjectHeader);
