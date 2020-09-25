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
import { media } from 'utils/styleUtils';

const Container = styled.div`
  padding-top: 40px;
  padding-bottom: 75px;
  background: #fff;
  position: relative;

  ${media.smallerThanMinTablet`
    padding-top: 20px;
    padding-bottom: 30px;
  `}
`;

const ProjectHeaderImageContainer = styled.div`
  width: 100%;
  height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-left: 20px;
  padding-right: 20px;
  padding-top: 40px;
  padding-bottom: 40px;
  margin-bottom: 45px;
  position: relative;
  border-radius: ${(props: any) => props.theme.borderRadius};
  overflow: hidden;

  ${media.smallerThanMinTablet`
    height: 160px;
    margin-bottom: 20px;
  `}
`;

const ProjectHeaderImage = styled.div<{ src: string }>`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-image: url(${(props: any) => props.src});
  background-repeat: no-repeat;
  background-position: center center;
  background-size: cover;
  overflow: hidden;
`;

const StyledProjectArchivedIndicator = styled(ProjectArchivedIndicator)<{
  hasHeaderImage: boolean;
}>`
  margin-top: ${(props) => (props.hasHeaderImage ? '-20px' : '0px')};
  margin-bottom: 25px;

  ${media.smallerThanMinTablet`
    display: none;
  `}
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
            <ProjectHeaderImageContainer>
              <ProjectHeaderImage src={projectHeaderImageLarge} />
            </ProjectHeaderImageContainer>
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
