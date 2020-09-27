import React, { memo, useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { isNilOrError } from 'utils/helperUtils';

// hooks
import useProject from 'hooks/useProject';
import usePhases from 'hooks/usePhases';
import useWindowSize from 'hooks/useWindowSize';

// services
import { IPhaseData, getCurrentPhase } from 'services/phases';

// components
import ContentContainer from 'components/ContentContainer';
import IdeaButton from 'components/IdeaButton';

// i18n
import T from 'components/T';

// style
import styled from 'styled-components';
import { lighten } from 'polished';
import { fontSizes, media, colors, viewportWidths } from 'utils/styleUtils';

const Container = styled.div`
  width: 100vw;
  position: fixed;
  top: ${({ theme }) => theme.menuHeight}px;
  top: 0px;
  z-index: 1004;
  background: #fff;
  border-bottom: solid 1px #ddd;
  opacity: 0;
  pointer-events: none;
  will-change: opacity;

  &.visible {
    opacity: 100;
    pointer-events: auto;
  }

  ${media.smallerThanMinTablet`
    top: 0px;
    border-bottom: solid 1px ${lighten(0.4, colors.label)};
  `}
`;

const InnerContainer = styled.div`
  min-height: 69px;
  display: flex;
  align-items: center;

  ${media.smallerThanMinTablet`
    flex-direction: column;
  `}
`;

const Left = styled.div`
  flex: 1 1 auto;
  display: flex;
  align-items: center;

  ${media.smallerThanMinTablet`
    display: none;
  `}
`;

const Right = styled.div`
  flex: 0 0 300px;
  width: 300px;
  display: flex;
  align-items: center;
  margin-left: 15px;

  ${media.smallerThanMinTablet`
    flex: 1 1 auto;
    width: 100%;
    flex-direction: column;
    align-items: stretch;
    justify-content: center;
    margin-left: 0px;
  `}
`;

const ProjectTitle = styled.h1`
  color: ${(props: any) => props.theme.colorText};
  font-size: ${fontSizes.xxl - 2}px;
  line-height: normal;
  font-weight: 600;
  text-align: left;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
  margin: 0;
  padding: 0;
`;

interface Props {
  projectId: string;
  className?: string;
}

const ProjectActionBar = memo<Props>(({ projectId, className }) => {
  const project = useProject({ projectId });
  const phases = usePhases(projectId);
  const { windowWidth } = useWindowSize();

  const [currentPhase, setCurrentPhase] = useState<IPhaseData | null>(null);
  const [isActionBarVisible, setIsActionBarVisible] = useState(false);
  const [isActionButtonVisible, setIsActionButtonVisible] = useState(false);

  const smallerThanSmallTablet = windowWidth <= viewportWidths.smallTablet;

  const portalElement = document?.getElementById('topbar-portal');

  useEffect(() => {
    setCurrentPhase(!isNilOrError(phases) ? getCurrentPhase(phases) : null);
  }, [phases]);

  useEffect(() => {
    window.addEventListener(
      'scroll',
      () => {
        const actionButtonElement = document.getElementById(
          'project-ideabutton'
        );
        const actionButtonYOffset = actionButtonElement
          ? actionButtonElement.getBoundingClientRect().top + window.pageYOffset
          : undefined;
        const actionButtonVisible = !!(
          actionButtonElement &&
          actionButtonYOffset &&
          window.pageYOffset >
            actionButtonYOffset - (smallerThanSmallTablet ? 14 : 34)
        );
        const actionBarVisible = !smallerThanSmallTablet
          ? window.pageYOffset > 78
          : actionButtonVisible;
        setIsActionBarVisible(actionBarVisible);
        setIsActionButtonVisible(actionButtonVisible);
      },
      { passive: true }
    );
  }, [projectId, smallerThanSmallTablet]);

  if (!isNilOrError(project) && portalElement) {
    const {
      process_type,
      participation_method,
      publication_status,
    } = project.attributes;

    return ReactDOM.createPortal(
      <Container
        className={`${className || ''} ${
          isActionBarVisible ? 'visible' : 'hidden'
        }`}
      >
        <ContentContainer>
          <InnerContainer>
            <Left>
              <ProjectTitle>
                <T value={project.attributes.title_multiloc} />
              </ProjectTitle>
            </Left>
            <Right>
              {isActionButtonVisible &&
                process_type === 'continuous' &&
                participation_method === 'ideation' &&
                publication_status !== 'archived' && (
                  <IdeaButton
                    projectId={project.id}
                    participationContextType="project"
                    fontWeight="500"
                    width={!smallerThanSmallTablet ? '300px' : undefined}
                  />
                )}
              {isActionButtonVisible &&
                currentPhase?.attributes.participation_method ===
                  'ideation' && (
                  <IdeaButton
                    projectId={project.id}
                    phaseId={currentPhase.id}
                    participationContextType="phase"
                    fontWeight="500"
                    width={!smallerThanSmallTablet ? '300px' : undefined}
                  />
                )}
            </Right>
          </InnerContainer>
        </ContentContainer>
      </Container>,
      portalElement
    );
  }

  return null;
});

export default ProjectActionBar;
