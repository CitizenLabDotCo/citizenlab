import React, { memo, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { isNilOrError } from 'utils/helperUtils';
import { CSSTransition } from 'react-transition-group';

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
import { maxPageWidth } from 'containers/ProjectsShowPage/styles';

const slideInOutTimeout = 250;
const slideInOutDistance = 14;
const slideInOutEasing = 'cubic-bezier(0.19, 1, 0.22, 1)';

const Container = styled.div`
  width: 100vw;
  position: fixed;
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

  ${media.smallerThanMaxTablet`
    top: 0px;
    border-bottom: solid 1px ${lighten(0.4, colors.label)};
  `}
`;

const InnerContainer = styled.div`
  min-height: 61px;
  display: flex;
  align-items: center;

  /* IE11 hack */
  @media all and (-ms-high-contrast: none), (-ms-high-contrast: active) {
    &:after {
      display: block;
      content: '';
      min-height: inherit;
      font-size: 0;
    }
  }

  ${media.smallerThanMaxTablet`
    flex-direction: column;
  `}
`;

const Left = styled.div`
  flex: 1 1 auto;
  display: flex;
  align-items: center;

  ${media.smallerThanMaxTablet`
    display: none;
  `}
`;

const Right = styled.div`
  flex: 0 0 310px;
  width: 310px;
  display: flex;
  align-items: center;
  margin-left: 15px;

  ${media.smallerThanMaxTablet`
    flex: 1 1 auto;
    width: 100%;
    flex-direction: column;
    align-items: stretch;
    justify-content: center;
    margin-left: 0px;
  `}
`;

const StyledIdeaButton = styled(IdeaButton)`
  opacity: 0;
  pointer-events: none;

  &.ideabutton-enter {
    transform: translateY(${slideInOutDistance}px);
    opacity: 0;

    &.ideabutton-enter-active {
      transform: translateY(0px);
      transition: all ${slideInOutTimeout}ms ${slideInOutEasing};
      opacity: 1;
    }
  }

  &.ideabutton-enter-done {
    opacity: 1;
    pointer-events: auto;
  }

  &.ideabutton-exit {
    opacity: 1;

    &.ideabutton-exit-active {
      opacity: 0;
      transition: all ${slideInOutTimeout - 100}ms ${slideInOutEasing};
    }
  }

  &.ideabutton-exit-done {
    opacity: 0;
    pointer-events: none;
  }
`;

const ProjectTitle = styled.h1`
  color: ${(props: any) => props.theme.colorText};
  font-size: ${fontSizes.xxl - 2}px;
  line-height: normal;
  font-weight: 500;
  text-align: left;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
  margin: 0;
  padding: 0;
  padding-top: 10px;
  padding-bottom: 10px;
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
  const [isVisible, setIsVisible] = useState(false);

  const smallerThanLargeTablet = windowWidth <= viewportWidths.largeTablet;

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
        setIsVisible(
          !!(
            actionButtonElement &&
            actionButtonYOffset &&
            window.pageYOffset >
              actionButtonYOffset - (smallerThanLargeTablet ? 14 : 30)
          )
        );
      },
      { passive: true }
    );
  }, [projectId, smallerThanLargeTablet]);

  if (!isNilOrError(project) && portalElement) {
    const {
      process_type,
      participation_method,
      publication_status,
    } = project.attributes;

    return createPortal(
      <Container
        className={`${className || ''} ${isVisible ? 'visible' : 'hidden'}`}
      >
        <ContentContainer maxWidth={maxPageWidth}>
          <InnerContainer>
            <Left>
              <ProjectTitle>
                <T value={project.attributes.title_multiloc} />
              </ProjectTitle>
            </Left>
            <Right>
              {process_type === 'continuous' &&
                participation_method === 'ideation' &&
                publication_status !== 'archived' && (
                  <CSSTransition
                    in={isVisible}
                    timeout={slideInOutTimeout}
                    mountOnEnter={false}
                    unmountOnExit={false}
                    enter={true}
                    exit={true}
                    classNames="ideabutton"
                  >
                    <StyledIdeaButton
                      projectId={project.id}
                      participationContextType="project"
                      fontWeight="500"
                      width={!smallerThanLargeTablet ? '310px' : undefined}
                    />
                  </CSSTransition>
                )}

              {currentPhase?.attributes.participation_method === 'ideation' && (
                <CSSTransition
                  in={isVisible}
                  timeout={slideInOutTimeout}
                  mountOnEnter={false}
                  unmountOnExit={false}
                  enter={true}
                  exit={true}
                  classNames="ideabutton"
                >
                  <StyledIdeaButton
                    projectId={project.id}
                    phaseId={currentPhase?.id}
                    participationContextType="phase"
                    fontWeight="500"
                    width={!smallerThanLargeTablet ? '310px' : undefined}
                  />
                </CSSTransition>
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
