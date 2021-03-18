import React, {
  memo,
  useCallback,
  useEffect,
  useState,
  FormEvent,
} from 'react';
import { isNilOrError } from 'utils/helperUtils';
import moment from 'moment';

// tracking
import tracks from './tracks';
import { trackEventByName } from 'utils/analytics';

// components
import { Icon } from 'cl2-component-library';

// hooks
import useLocale from 'hooks/useLocale';
import useAppConfiguration from 'hooks/useAppConfiguration';
import usePhases from 'hooks/usePhases';

// services
import { IPhaseData, getCurrentPhase } from 'services/phases';

// events
import { selectedPhase$, selectPhase } from './events';

// i18n
import messages from 'containers/ProjectsShowPage/messages';
import { getLocalized } from 'utils/i18n';
import { FormattedMessage } from 'utils/cl-intl';

// utils
import { getIsoDate } from 'utils/dateUtils';

// style
import styled, { css } from 'styled-components';
import { media, colors, fontSizes, isRtl } from 'utils/styleUtils';
import { ScreenReaderOnly } from 'utils/a11y';
import { darken, rgba, transparentize } from 'polished';

const greyOpaque = `${colors.label}`;
const greenTransparent = `${rgba(colors.clGreen, 0.15)}`;
const greenOpaque = `${colors.clGreen}`;

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
  flex-direction: row;
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
    background: ${greyOpaque};
    color: #fff;
  }
  ${PhaseText} {
    color: ${greyOpaque};
  }
`;

const currentPhaseBar = css`
  ${PhaseBar} {
    background: ${greenTransparent};
    color: ${transparentize(0.25, greenOpaque)};
  }
  ${PhaseText} {
    color: ${transparentize(0.25, greenOpaque)};
  }
`;

const currentSelectedPhaseBar = css`
  ${PhaseBar} {
    background: ${greenOpaque};
    color: #fff;
  }
  ${PhaseText} {
    color: ${greenOpaque};
  }
`;

const PhaseContainer = styled.div<{ width: number }>`
  width: ${(props) => props.width}%;
  min-width: 80px;
  display: flex;
  flex-direction: column;
  position: relative;
  cursor: pointer;
  margin-right: ${(props: any) => (!props.last ? '1px' : '0px')};

  ${media.smallerThanMinTablet`
    width: 100%;
    min-width: unset;
  `}

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

const Timeline = memo<Props>(({ projectId, className }) => {
  const locale = useLocale();
  const currentTenant = useAppConfiguration();
  const phases = usePhases(projectId);

  const [selectedPhase, setSelectedPhase] = useState<IPhaseData | null>(null);

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

  const removeFocus = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
  }, []);

  if (
    !isNilOrError(locale) &&
    !isNilOrError(currentTenant) &&
    !isNilOrError(phases) &&
    phases.length > 0
  ) {
    const currentPhase = getCurrentPhase(phases);
    const currentPhaseId = currentPhase ? currentPhase.id : null;
    const selectedPhaseId = selectedPhase ? selectedPhase.id : null;
    const currentTenantLocales =
      currentTenant.data.attributes.settings.core.locales;
    const totalNumberOfDays = phases
      .map((phaseData) => {
        const startIsoDate = getIsoDate(phaseData.attributes.start_at);
        const endIsoDate = getIsoDate(phaseData.attributes.end_at);
        const startMoment = moment(startIsoDate, 'YYYY-MM-DD');
        const endMoment = moment(endIsoDate, 'YYYY-MM-DD');
        const numberOfDays = Math.abs(startMoment.diff(endMoment, 'days')) + 1;
        return numberOfDays;
      })
      .reduce((accumulator, numberOfDays) => {
        return accumulator + numberOfDays;
      });

    return (
      <Container
        id="project-timeline"
        className={className || ''}
        isHidden={phases.length === 1}
      >
        <ContainerInner>
          <Phases className="e2e-phases">
            <ScreenReaderOnly>
              <FormattedMessage {...messages.a11y_phasesOverview} />
            </ScreenReaderOnly>
            {phases.map((phase, index) => {
              const phaseNumber = index + 1;
              const phaseTitle = getLocalized(
                phase.attributes.title_multiloc,
                locale,
                currentTenantLocales
              );
              const isFirst = index === 0;
              const isLast = index === phases.length - 1;
              const isCurrentPhase = phase.id === currentPhaseId;
              const isSelectedPhase = phase.id === selectedPhaseId;
              const startIsoDate = getIsoDate(phase.attributes.start_at);
              const endIsoDate = getIsoDate(phase.attributes.end_at);
              const startMoment = moment(startIsoDate, 'YYYY-MM-DD');
              const endMoment = moment(endIsoDate, 'YYYY-MM-DD');
              const numberOfDays =
                Math.abs(startMoment.diff(endMoment, 'days')) + 1;
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
                  key={index}
                  width={width}
                  onMouseDown={removeFocus}
                  onClick={handleOnPhaseSelection(phase)}
                >
                  <PhaseBar>
                    <span aria-hidden>{phaseNumber}</span>
                    <ScreenReaderOnly>
                      <FormattedMessage
                        {...messages.a11y_phaseX}
                        values={{
                          phaseNumber,
                          phaseTitle,
                        }}
                      />
                    </ScreenReaderOnly>
                    {!isLast && <PhaseArrow name="phase_arrow" ariaHidden />}
                  </PhaseBar>
                  <PhaseText
                    current={isCurrentPhase}
                    selected={isSelectedPhase}
                    aria-hidden
                  >
                    {phaseTitle}
                  </PhaseText>
                </PhaseContainer>
              );
            })}
          </Phases>
        </ContainerInner>
      </Container>
    );
  }

  return null;
});

export default Timeline;
