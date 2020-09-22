import React, { memo } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import ContentContainer from 'components/ContentContainer';
import ProjectInfo from './ProjectInfo';
import ProjectArchivedIndicator from 'components/ProjectArchivedIndicator';

// hooks
import useProject from 'hooks/useProject';

// style
import styled from 'styled-components';

const Container = styled.div`
  padding-top: 40px;
  padding-bottom: 75px;
  background: #fff;
`;

const ProjectHeaderImage = styled.div<{ src: string }>`
  width: 100%;
  height: 220px;
  margin-bottom: 45px;
  background-image: url(${(props: any) => props.src});
  background-repeat: no-repeat;
  background-position: center center;
  background-size: cover;
  border-radius: ${(props: any) => props.theme.borderRadius};
`;

const StyledProjectArchivedIndicator = styled(ProjectArchivedIndicator)<{
  hasHeaderImage: boolean;
}>`
  margin-top: ${(props) => (props.hasHeaderImage ? '-20px' : '0px')};
  margin-bottom: 25px;
`;

const StyledProjectInfo = styled(ProjectInfo)``;

interface Props {
  projectId: string;
  className?: string;
}

const ProjectHeader = memo<Props>(({ projectId, className }) => {
  const project = useProject({ projectId });

  if (!isNilOrError(project)) {
    const projectHeaderImageLarge = project?.attributes?.header_bg?.large;

    return (
      <Container className={className || ''}>
        <ContentContainer>
          {projectHeaderImageLarge && projectHeaderImageLarge.length > 1 && (
            <ProjectHeaderImage src={projectHeaderImageLarge} />
          )}
          <StyledProjectArchivedIndicator
            projectId={projectId}
            hasHeaderImage={!!projectHeaderImageLarge}
          />
          <StyledProjectInfo projectId={projectId} />
        </ContentContainer>
      </Container>
    );
  }

  return null;
});

export default ProjectHeader;
