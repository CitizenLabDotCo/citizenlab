import React, { memo } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import ContentContainer from 'components/ContentContainer';
import ProjectInfo from './ProjectInfo';
import ProjectArchivedIndicator from 'components/ProjectArchivedIndicator';

// hooks
import useProject from 'hooks/useProject';

// i18n
// import T from 'components/T';

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
    padding-bottom: 45px;
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
    height: 180px;
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

// const ProjectHeaderOverlay = styled.div`
//   background: #000;
//   opacity: 0.1;
//   position: absolute;
//   top: 0;
//   bottom: 0;
//   left: 0;
//   right: 0;
//   display: none;
// `;

// const ProjectTitle = styled.h1`
//   color: #fff;
//   font-size: ${fontSizes.xxxl}px;
//   line-height: normal;
//   font-weight: 500;
//   text-align: center;
//   overflow-wrap: break-word;
//   word-wrap: break-word;
//   word-break: break-word;
//   margin: 0;
//   padding: 0;
//   z-index: 2;
// `;

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
            <ProjectHeaderImageContainer>
              <ProjectHeaderImage src={projectHeaderImageLarge} />
              {/* <ProjectHeaderOverlay />
              <ProjectTitle>
                <T value={project.attributes.title_multiloc} />
              </ProjectTitle> */}
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
