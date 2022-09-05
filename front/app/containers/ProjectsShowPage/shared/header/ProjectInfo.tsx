import React, { memo } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import Fragment from 'components/Fragment';
import FileAttachments from 'components/UI/FileAttachments';
import ProjectInfoSideBar from './ProjectInfoSideBar';
import ProjectArchivedIndicator from 'components/ProjectArchivedIndicator';
import ReadMoreWrapper from 'containers/ProjectsShowPage/shared/header/ReadMoreWrapper';

// hooks
import useProject from 'hooks/useProject';
import useProjectFiles from 'hooks/useProjectFiles';
import { useWindowSize, Title } from '@citizenlab/cl2-component-library';

// i18n
import T from 'components/T';

// style
import styled from 'styled-components';
import { media, viewportWidths, isRtl } from 'utils/styleUtils';

const Container = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  ${isRtl`
    flex-direction: row-reverse;
  `}

  ${media.smallerThanMaxTablet`
    flex-direction: column;
    align-items: stretch;
    justify-content: flex-start;
  `}
`;

const Left = styled.div`
  flex: 1;

  ${media.smallerThanMaxTablet`
    margin-bottom: 20px;
  `}
`;

const Right = styled.div`
  flex: 0 0 310px;
  width: 310px;
  margin-left: 120px;

  ${isRtl`
    margin-right: 120px;
    margin-left: auto;
  `}

  ${media.smallerThanMaxTablet`
    flex: 1 1 auto;
    width: 100%;
    margin-left: 0px;
  `}
`;

const StyledProjectArchivedIndicator = styled(ProjectArchivedIndicator)`
  margin-bottom: 20px;
`;

interface Props {
  projectId: string;
  className?: string;
}

const ProjectInfo = memo<Props>(({ projectId, className }) => {
  const project = useProject({ projectId });
  const projectFiles = useProjectFiles(projectId);
  const { windowWidth } = useWindowSize();

  const smallerThanLargeTablet = windowWidth <= viewportWidths.largeTablet;

  if (!isNilOrError(project)) {
    return (
      <Container className={`${className || ''} e2e-project-info`}>
        <Fragment name={`projects/${project.id}/info`}>
          <Left>
            <Title variant="h1" color="colorText">
              <T value={project.attributes.title_multiloc} />
            </Title>

            {smallerThanLargeTablet && (
              <StyledProjectArchivedIndicator projectId={projectId} />
            )}

            <ReadMoreWrapper
              fontSize="m"
              contentId="description"
              value={project.attributes.description_multiloc}
            />

            {!isNilOrError(projectFiles) &&
              projectFiles &&
              projectFiles.data.length > 0 && (
                <FileAttachments files={projectFiles.data} />
              )}
          </Left>
          <Right>
            <ProjectInfoSideBar projectId={project.id} />
          </Right>
        </Fragment>
      </Container>
    );
  }

  return null;
});

export default ProjectInfo;
