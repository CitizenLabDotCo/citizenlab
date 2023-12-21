import React, {
  useCallback,
  FormEvent,
  KeyboardEvent,
  useRef,
  useState,
  useEffect,
} from 'react';
import { removeFocusAfterMouseClick } from 'utils/helperUtils';
import Tippy from '@tippyjs/react';

// tracking
import tracks from './tracks';
import { trackEventByName } from 'utils/analytics';

// components
import {
  Box,
  Icon,
  media,
  colors,
  fontSizes,
  isRtl,
} from '@citizenlab/cl2-component-library';
import PhaseDescription from './PhaseDescription';

// hooks
import usePhases from 'api/phases/usePhases';
import useLocalize from 'hooks/useLocalize';
import useProjectById from 'api/projects/useProjectById';

// services
import { getCurrentPhase } from 'api/phases/utils';
import { IPhaseData } from 'api/phases/types';

// i18n
import messages from 'containers/ProjectsShowPage/messages';
import { FormattedMessage } from 'utils/cl-intl';

// utils
import setPhaseURL from './setPhaseURL';
import clHistory from 'utils/cl-router/history';

// style
import styled, { css } from 'styled-components';
import { ScreenReaderOnly } from 'utils/a11y';
import { darken, rgba } from 'polished';

const MIN_PHASE_WIDTH_PX = 44;
const CONTAINER_PADDING_PX = 20;

const grey = colors.textSecondary;
const greenTransparent = rgba(colors.success, 0.15);
const green = colors.success;
const darkGreen = colors.green700;

const RtlBox = styled(Box)`
  ${isRtl`
    flex-direction: row-reverse;
  `};
`;

const Arrow = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg viewBox="134.282 57.93 18.666 24" aria-hidden={true} {...props}>
      <path d="M144.617 80.289l8.1-9.719c.309-.371.309-.91 0-1.281l-8.1-9.719a1 1 0 0 1 .769-1.641h-11.104c.297 0 .578.132.769.359l9.166 11c.309.371.309.91 0 1.281l-9.166 11a1 1 0 0 1-.769.359h11.104a.999.999 0 0 1-.769-1.639z" />
    </svg>
  );
};

const Container = styled.div<{ isHidden: boolean }>`
  width: 100%;
  display: ${(props) => (props.isHidden ? 'none' : 'flex')};
  justify-content: center;
`;

const ContainerInner = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

const Phases = styled.div`
  width: 100%;
  margin: 0;
  margin-left: auto;
  margin-right: auto;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
`;

const phaseBarHeight = '24px';

const PhaseBar = styled.button`
  width: 100%;
  height: calc(${phaseBarHeight} - 1px);
  color: ${darken(0.1, colors.textSecondary)};
  font-size: ${fontSizes.s}px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${darken(0.08, colors.grey200)};
  transition: background 60ms ease-out;
  position: relative;
  cursor: pointer;
  border: none;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
`;

const PhaseArrow = styled(Arrow)`
  width: 20px;
  height: ${phaseBarHeight};
  fill: ${colors.background};
  position: absolute;
  top: 0px;
  right: -9px;
  z-index: 2;

  ${isRtl`
    transform: rotate(180deg);
    right: auto;
    left: -9px;
  `}
`;

const PlusIcon = styled(Icon)`
  fill: ${colors.coolGrey700};
`;

const PhaseText = styled.div<{ current: boolean; selected: boolean }>`
  color: ${darken(0.1, colors.textSecondary)};
  font-size: ${fontSizes.s}px;
  font-weight: 400;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  line-height: 20px;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-all;
  word-break: break-word;
  hyphens: auto;
  max-height: 60px;
  margin-top: 5px;
  margin-left: 5px;
  margin-right: 5px;
  transition: color 80ms ease-out;

  ${media.phone`
    display: none;
  `}
`;

const selectedPhaseBar = css`
  ${PhaseBar} {
    background: ${grey};
    color: #fff;
  }
  ${PhaseText} {
    color: ${grey};
  }
  &:hover {
    ${PlusIcon} {
      fill: ${colors.white};
    }
  }
`;

const currentPhaseBar = css`
  ${PhaseBar} {
    background: ${greenTransparent};
    color: ${darkGreen};
  }
  ${PhaseText} {
    color: ${darkGreen};
  }
`;

const currentSelectedPhaseBar = css`
  ${PhaseBar} {
    background: ${green};
    color: #fff;
  }
  ${PhaseText} {
    color: ${darkGreen};
  }
`;

const PhaseContainer = styled.div<{
  width?: number;
  breakpoint: number;
  last: boolean;
  isBackoffice?: boolean;
}>`
  width: ${(props) => (props.width ? `${props.width}%` : '100%')};
  min-width: ${(props) =>
    props.isBackoffice ? '44px' : `${MIN_PHASE_WIDTH_PX}px`};
  display: flex;
  flex-direction: column;
  position: relative;
  cursor: pointer;
  margin-right: ${(props) => (!props.last ? '1px' : '0px')};

  @media (max-width: ${({ breakpoint }) =>
      breakpoint + CONTAINER_PADDING_PX * 2}px) {
    width: 100%;
    min-width: unset;
  }

  &.first ${PhaseBar} {
    border-radius: ${(props) => props.theme.borderRadius} 0px 0px
      ${(props) => props.theme.borderRadius};
  }

  &.last ${PhaseBar} {
    border-radius: 0px ${(props) => props.theme.borderRadius}
      ${(props) => props.theme.borderRadius} 0px;
  }

  &:focus,
  &:hover {
    ${selectedPhaseBar}
  }

  &.currentPhase:not(.selectedPhase) {
    ${currentPhaseBar}

    &:hover {
      ${currentSelectedPhaseBar}
    }
  }

  &.selectedPhase:not(.currentPhase) {
    ${selectedPhaseBar}
  }

  &.selectedPhase.currentPhase {
    ${currentSelectedPhaseBar}
  }
`;

interface Props {
  projectId: string;
  className?: string;
  selectedPhase?: IPhaseData;
  setSelectedPhase: (phase: IPhaseData) => void;
  isBackoffice?: boolean;
}

const Timeline = ({
  projectId,
  className,
  selectedPhase,
  setSelectedPhase,
  isBackoffice = false,
}: Props) => {
  const { data: phases } = usePhases(projectId);
  const { data: project } = useProjectById(projectId);
  const localize = useLocalize();
  const tabsRef = useRef<HTMLButtonElement[]>([]);
  const [tooltipVisible, setTooltipVisible] = useState(false);

  useEffect(() => {
    const showTooltip = phases?.data?.length === 1;
    setTooltipVisible(showTooltip);

    const timeout = setTimeout(() => {
      setTooltipVisible(false);
    }, 5000);

    return () => clearTimeout(timeout);
  }, [phases]);

  const handleOnPhaseSelection = useCallback(
    (phase: IPhaseData | undefined) => (event: FormEvent) => {
      trackEventByName(tracks.clickOnPhase);
      event.preventDefault();

      if (phase && phases && project) {
        setPhaseURL(phase, phases.data, project.data, isBackoffice);
      }
    },
    [isBackoffice, phases, project]
  );

  const handleTabListOnKeyDown = (e: KeyboardEvent) => {
    const arrowLeftPressed = e.key === 'ArrowLeft';
    const arrowRightPressed = e.key === 'ArrowRight';

    if ((arrowLeftPressed || arrowRightPressed) && phases) {
      const currentPhaseIndex = selectedPhase
        ? phases.data.indexOf(selectedPhase)
        : 0;

      if (arrowRightPressed) {
        // if we're at the end of the timeline, go to start (index 0),
        // otherwise on to the right (index + 1)
        const selectedPhaseIndex =
          currentPhaseIndex === phases.data.length - 1
            ? 0
            : currentPhaseIndex + 1;
        setSelectedPhase(phases.data[selectedPhaseIndex]);
        tabsRef.current[selectedPhaseIndex].focus();

        // Move left
      } else if (arrowLeftPressed) {
        // if we're at the beginning of the timeline, go to end (array length - 1),
        // otherwise on to the left (index - 1)
        const selectedPhaseIndex =
          currentPhaseIndex === 0
            ? phases.data.length - 1
            : currentPhaseIndex - 1;
        setSelectedPhase(phases.data[selectedPhaseIndex]);
        tabsRef.current[selectedPhaseIndex].focus();
      }
    }
  };

  if (phases && phases.data.length > 0) {
    const currentPhase = getCurrentPhase(phases.data);
    const currentPhaseId = currentPhase ? currentPhase.id : null;
    const selectedPhaseId = selectedPhase?.id;
    const phasesBreakpoint = phases.data.length * MIN_PHASE_WIDTH_PX;
    const phaseSectionWidth = (1 / phases.data.length) * 100;

    return (
      <Container
        id="project-timeline"
        className={className || ''}
        isHidden={phases.data.length === 0}
      >
        <ContainerInner>
          <ScreenReaderOnly>
            <FormattedMessage {...messages.a11y_phasesOverview} />
          </ScreenReaderOnly>
          <Phases className="e2e-phases" role="tablist">
            <RtlBox display="flex" mb="20px">
              {phases.data.map((phase, phaseIndex) => {
                const phaseNumber = phaseIndex + 1;
                const phaseTitle = localize(phase.attributes.title_multiloc);
                const isFirst = phaseIndex === 0;
                const isLast =
                  !isBackoffice && phaseIndex === phases.data.length - 1;
                const isCurrentPhase = phase.id === currentPhaseId;
                const isSelectedPhase = phase.id === selectedPhaseId;
                const classNames = [
                  isFirst ? 'first' : null,
                  isLast ? 'last' : null,
                  isCurrentPhase ? 'currentPhase' : null,
                  isSelectedPhase ? 'selectedPhase' : null,
                ]
                  .filter((className) => className)
                  .join(' ');
                const showArrow = !(phaseIndex === phases.data.length - 1);

                return (
                  <PhaseContainer
                    className={classNames}
                    key={phaseIndex}
                    width={phaseSectionWidth}
                    breakpoint={phasesBreakpoint}
                    last={isLast}
                  >
                    <PhaseBar
                      onMouseDown={removeFocusAfterMouseClick}
                      onKeyDown={handleTabListOnKeyDown}
                      onClick={handleOnPhaseSelection(phase)}
                      aria-current={isCurrentPhase}
                      // Implementation details: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/tab_role
                      aria-selected={isSelectedPhase}
                      aria-controls={`phase-description-panel-${phaseNumber}`}
                      role="tab"
                      ref={(el) => el && (tabsRef.current[phaseIndex] = el)}
                      tabIndex={isSelectedPhase ? 0 : -1}
                      id={`phase-tab-${phaseNumber}`}
                    >
                      <span aria-hidden>{phaseNumber}</span>
                      <ScreenReaderOnly>
                        <FormattedMessage
                          {...messages.a11y_phase}
                          values={{
                            phaseNumber,
                            phaseTitle,
                          }}
                        />
                      </ScreenReaderOnly>
                      {showArrow && <PhaseArrow />}
                    </PhaseBar>
                    <PhaseText
                      current={isCurrentPhase}
                      selected={isSelectedPhase}
                    >
                      {phaseTitle}
                    </PhaseText>
                  </PhaseContainer>
                );
              })}
              {isBackoffice && (
                <Box width="44px" ml="8px">
                  <PhaseContainer
                    className="first"
                    key="new-phase"
                    breakpoint={phasesBreakpoint}
                    last
                  >
                    <Tippy
                      interactive={true}
                      visible={tooltipVisible}
                      placement="bottom-start"
                      content={
                        <Box p="8px 12px">
                          <FormattedMessage {...messages.createANewPhase} />
                        </Box>
                      }
                      popperOptions={{
                        strategy: 'fixed',
                      }}
                    >
                      <PhaseBar
                        onMouseDown={removeFocusAfterMouseClick}
                        onKeyDown={handleTabListOnKeyDown}
                        onClick={() => {
                          clHistory.push(
                            `/admin/projects/${projectId}/phases/new`
                          );
                        }}
                        role="tab"
                        id="new-phase"
                      >
                        <span aria-hidden>
                          <PlusIcon name="plus" height="16px" />
                        </span>
                        <ScreenReaderOnly>
                          <FormattedMessage {...messages.newPhase} />
                        </ScreenReaderOnly>
                      </PhaseBar>
                    </Tippy>
                  </PhaseContainer>
                </Box>
              )}
            </RtlBox>
            {!isBackoffice && selectedPhaseId && (
              <PhaseDescription
                projectId={projectId}
                selectedPhaseId={selectedPhaseId}
              />
            )}
          </Phases>
        </ContainerInner>
      </Container>
    );
  }

  return null;
};

export default Timeline;
