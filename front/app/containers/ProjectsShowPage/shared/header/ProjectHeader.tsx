import React, { useState, memo } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { canModerateProject } from 'services/permissions/rules/projectPermissions';
import { adminProjectsProjectPath } from 'containers/Admin/projects/routes';
// components
import ContentContainer from 'components/ContentContainer';
import ProjectInfo from './ProjectInfo';
import ProjectArchivedIndicator from 'components/ProjectArchivedIndicator';
import Button from 'components/UI/Button';
import Image from 'components/UI/Image';
import Outlet from 'components/Outlet';

// hooks
import useProject from 'hooks/useProject';
import useAuthUser from 'hooks/useAuthUser';

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
  margin: 0 0 10px auto;

  ${isRtl`
    margin: 0 0 auto 10px;
  `}
`;

const HeaderImageContainer = styled.div`
  width: 100%;
  aspect-ratio: 5 / 1;
  margin-bottom: 30px;
  border-radius: ${(props: any) => props.theme.borderRadius};
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;

  ${media.phone`
    margin-bottom: 20px;
  `}
`;

const HeaderImage = styled(Image)`
  width: 100%;

  ${media.phone`
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
                {/*
                  Needs to change: Outlet should always render.
                  Condition needs to be inside the Outlet.
                */}
                {projectFolderId && (
                  <Outlet
                    id="app.containers.ProjectsShowPage.shared.header.ProjectHeader.GoBackButton"
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
              <HeaderImageContainer>
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
