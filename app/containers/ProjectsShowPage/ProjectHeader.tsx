import React, { memo } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import ContentContainer from 'components/ContentContainer';
import ProjectInfo from './ProjectInfo';

// hooks
import useProject from 'hooks/useProject';

// style
import styled from 'styled-components';

const Container = styled.div``;

const ProjectHeaderImage = styled.div<{ src: string }>`
  width: 100%;
  height: 220px;
  background-image: url(${(props: any) => props.src});
  background-repeat: no-repeat;
  background-position: center center;
  background-size: cover;
  border-radius: ${(props: any) => props.theme.borderRadius};
  margin-top: 40px;
  transform: translate3d(0, 0, 0);
`;

const StyledProjectInfo = styled(ProjectInfo)`
  margin-top: 40px;
`;

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
          {projectHeaderImageLarge && (
            <ProjectHeaderImage src={projectHeaderImageLarge} />
          )}
          <StyledProjectInfo projectId={projectId} />
        </ContentContainer>
      </Container>
    );
  }

  return null;
});

export default ProjectHeader;
