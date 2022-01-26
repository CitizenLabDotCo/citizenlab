import React, {
  useCallback,
  useEffect,
  useState,
  FormEvent,
  KeyboardEvent,
  useRef,
} from 'react';
import { isNilOrError, removeFocusAfterMouseClick } from 'utils/helperUtils';
import moment from 'moment';

// tracking
import tracks from './tracks';
import { trackEventByName } from 'utils/analytics';

// components
import { Icon, Box } from '@citizenlab/cl2-component-library';
import PhaseDescriptions from './PhaseDescriptions';

// hooks
import usePhases from 'hooks/usePhases';
import useLocalize from 'hooks/useLocalize';

// services
import { IPhaseData, getCurrentPhase } from 'services/phases';

// events
import { selectedPhase$, selectPhase } from './events';

// i18n
import messages from 'containers/ProjectsShowPage/messages';
import { FormattedMessage } from 'utils/cl-intl';

// utils
import { getIsoDate } from 'utils/dateUtils';

// style
import styled, { css } from 'styled-components';
import { media, colors, fontSizes, isRtl } from 'utils/styleUtils';
import { ScreenReaderOnly } from 'utils/a11y';
import { darken, rgba } from 'polished';

const MIN_PHASE_WIDTH_PX = 110;
const CONTAINER_PADDING_PX = 20;

const grey = colors.label;
const greenTransparent = rgba(colors.clGreen, 0.15);
const green = colors.clGreen;
const darkGreen = colors.clGreenDark;

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

  ${isRtl`
    flex-direction: row-reverse;
  `}
`;

const phaseBarHeight = '24px';

const PhaseBar = styled.button`
  width: 100%;
  height: calc(${phaseBarHeight} - 1px);
  color: ${darken(0.1, colors.label)};
  font-size: ${fontSizes.small}px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${darken(0.08, colors.lightGreyishBlue)};
  transition: background 60ms ease-out;
  position: relative;
  cursor: pointer;
  border: none;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
`;

const PhaseArrow = styled(Icon)`
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

const PhaseText = styled.div<{ current: boolean; selected: boolean }>`
  color: ${darken(0.1, colors.label)};
  font-size: ${fontSizes.small}px;
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

  ${media.smallerThanMinTablet`
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

const PhaseContainer = styled.div<{ width: number; breakpoint: number }>`
  width: ${(props) => props.width}%;
  min-width: ${MIN_PHASE_WIDTH_PX}px;
  display: flex;
  flex-direction: column;
  position: relative;
  cursor: pointer;
  margin-right: ${(props: any) => (!props.last ? '1px' : '0px')};

  @media (max-width: ${({ breakpoint }) =>
      breakpoint + CONTAINER_PADDING_PX * 2}px) {
    width: 100%;
    min-width: unset;
  }

  &.first ${PhaseBar} {
    border-radius: ${(props: any) => props.theme.borderRadius} 0px 0px
      ${(props: any) => props.theme.borderRadius};
  }

  &.last ${PhaseBar} {
    border-radius: 0px ${(props: any) => props.theme.borderRadius}
      ${(props: any) => props.theme.borderRadius} 0px;
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
}

const Timeline = ({ projectId, className }: Props) => {
  const phases = usePhases(projectId);
  const localize = useLocalize();
  const [selectedPhase, setSelectedPhase] = useState<IPhaseData | null>(null);
  const tabsRef = useRef<HTMLButtonElement[]>([]);

  useEffect(() => {
    const subscription = selectedPhase$.subscribe((selectedPhase) => {
      setSelectedPhase(selectedPhase);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleOnPhaseSelection = useCallback(
    (phase: IPhaseData | null) => (event: FormEvent) => {
      trackEventByName(tracks.clickOnPhase);
      event.preventDefault();
      selectPhase(phase);
    },
    []
  );

  const handleTabListOnKeyDown = (e: KeyboardEvent) => {
    const arrowLeftPressed = e.key === 'ArrowLeft';
    const arrowRightPressed = e.key === 'ArrowRight';

    if (
      (arrowLeftPressed || arrowRightPressed) &&
      !isNilOrError(phases) &&
      // to change: selectedPhase should not be null. Should be current phase, or last phase if proj is over
      // should be first phase if project hasn't started
      selectedPhase
    ) {
      const currentPhaseIndex = phases.indexOf(selectedPhase);

      if (arrowRightPressed) {
        // if we're at the end of the timeline, go to start (index 0),
        // otherwise on to the right (index + 1)
        const selectedPhaseIndex =
          currentPhaseIndex === phases.length - 1 ? 0 : currentPhaseIndex + 1;
        setSelectedPhase(phases[selectedPhaseIndex]);
        tabsRef.current[selectedPhaseIndex].focus();

        // Move left
      } else if (arrowLeftPressed) {
        // if we're at the beginning of the timeline, go to end (array length - 1),
        // otherwise on to the left (index - 1)
        const selectedPhaseIndex =
          currentPhaseIndex === 0 ? phases.length - 1 : currentPhaseIndex - 1;
        setSelectedPhase(phases[selectedPhaseIndex]);
        tabsRef.current[selectedPhaseIndex].focus();
      }
    }
  };

  if (!isNilOrError(phases) && phases.length > 0) {
    const currentPhase = getCurrentPhase(phases);
    const currentPhaseId = currentPhase ? currentPhase.id : null;
    const selectedPhaseId = selectedPhase ? selectedPhase.id : null;

    const totalNumberOfDays = phases
      .map(getNumberOfDays)
      .reduce((accumulator, numberOfDays) => {
        return accumulator + numberOfDays;
      });

    const phasesBreakpoint = phases.length * MIN_PHASE_WIDTH_PX;

    return (
      <Container
        id="project-timeline"
        className={className || ''}
        isHidden={phases.length === 1}
      >
        <ContainerInner>
          <ScreenReaderOnly>
            <FormattedMessage {...messages.a11y_phasesOverview} />
          </ScreenReaderOnly>
          <Phases className="e2e-phases" role="tablist">
            <Box display="flex" mb="20px">
              {phases.map((phase, phaseIndex) => {
                const phaseNumber = phaseIndex + 1;
                const phaseTitle = localize(phase.attributes.title_multiloc);
                const isFirst = phaseIndex === 0;
                const isLast = phaseIndex === phases.length - 1;
                const isCurrentPhase = phase.id === currentPhaseId;
                const isSelectedPhase = phase.id === selectedPhaseId;

                const numberOfDays = getNumberOfDays(phase);

                const width = Math.round(
                  (numberOfDays / totalNumberOfDays) * 100
                );

                const classNames = [
                  isFirst ? 'first' : null,
                  isLast ? 'last' : null,
                  isCurrentPhase ? 'currentPhase' : null,
                  isSelectedPhase ? 'selectedPhase' : null,
                ]
                  .filter((className) => className)
                  .join(' ');

                return (
                  <PhaseContainer
                    className={classNames}
                    key={phaseIndex}
                    width={width}
                    breakpoint={phasesBreakpoint}
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
                      <span>{phaseNumber}</span>
                      {!isLast && <PhaseArrow name="phase_arrow" ariaHidden />}
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
            </Box>
            {/* To be changed, selectedPhaseId needs to be always here,
              or the parent of this shouldn't render.
            */}
            {selectedPhaseId && (
              <PhaseDescriptions
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

function getNumberOfDays(phase: IPhaseData) {
  const startIsoDate = getIsoDate(phase.attributes.start_at);
  const endIsoDate = getIsoDate(phase.attributes.end_at);
  const startMoment = moment(startIsoDate, 'YYYY-MM-DD');
  const endMoment = moment(endIsoDate, 'YYYY-MM-DD');
  const numberOfDays = Math.abs(startMoment.diff(endMoment, 'days')) + 1;
  return numberOfDays;
}
