import React, { memo, useState, useCallback, useEffect } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { findIndex } from 'lodash-es';
import Tippy from '@tippyjs/react';

// tracking
import tracks from './tracks';
import { trackEventByName } from 'utils/analytics';

// components
import { Button } from 'cl2-component-library';

// services
import { IPhaseData, getCurrentPhase } from 'services/phases';

// events
import { selectedPhase$, selectPhase } from './events';

// hooks
import useLocale from 'hooks/useLocale';
import usePhases from 'hooks/usePhases';

// i18n
import messages from 'containers/ProjectsShowPage/messages';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

// style
import styled from 'styled-components';
import { colors, isRtl } from 'utils/styleUtils';

const Container = styled.div`
  display: flex;
  align-items: center;
  margin-left: 15px;

  ${isRtl`
    margin-left: 0;
    margin-right: 15px;
    flex-direction: row-reverse;
  `}
`;

const PreviousPhaseButton = styled(Button)`
  margin-right: 5px;

  ${isRtl`
    margin-right: 0;
    margin-left: 5px;
    transform: rotate(180deg);
  `}
`;

const CurrentPhaseButton = styled(Button)``;

const NextPhaseButton = styled(Button)`
  margin-left: 5px;

  ${isRtl`
    margin-left: 0;
    margin-right: 5px;
    transform: rotate(180deg);
  `}
`;

interface Props {
  projectId: string;
  buttonStyle?: 'secondary' | 'white';
  className?: string;
}

const PhaseNavigation = memo<Props & InjectedIntlProps>(
  ({ projectId, buttonStyle, className, intl: { formatMessage } }) => {
    const locale = useLocale();
    const phases = usePhases(projectId);

    const [selectedPhase, setSelectedPhase] = useState<IPhaseData | null>(null);

    useEffect(() => {
      const subscription = selectedPhase$.subscribe((selectedPhase) => {
        setSelectedPhase(selectedPhase);
      });

      return () => subscription.unsubscribe();
    }, []);

    const goToNextPhase = useCallback(() => {
      trackEventByName(tracks.clickNextPhaseButton);

      if (!isNilOrError(phases)) {
        const selectedPhaseId = selectedPhase ? selectedPhase.id : null;
        const selectedPhaseIndex = findIndex(
          phases,
          (phase) => phase.id === selectedPhaseId
        );
        const nextPhaseIndex =
          phases.length >= selectedPhaseIndex + 2 ? selectedPhaseIndex + 1 : 0;
        const nextPhase = phases[nextPhaseIndex];
        selectPhase(nextPhase);
      }
    }, [phases, selectedPhase]);

    const goToPreviousPhase = useCallback(() => {
      trackEventByName(tracks.clickPreviousPhaseButton);

      if (!isNilOrError(phases)) {
        const selectedPhaseId = selectedPhase ? selectedPhase.id : null;
        const selectedPhaseIndex = findIndex(
          phases,
          (phase) => phase.id === selectedPhaseId
        );
        const prevPhaseIndex =
          selectedPhaseIndex > 0 ? selectedPhaseIndex - 1 : phases.length - 1;
        const prevPhase = phases[prevPhaseIndex];
        selectPhase(prevPhase);
      }
    }, [phases, selectedPhase]);

    const goToCurrentPhase = useCallback(() => {
      if (!isNilOrError(phases)) {
        trackEventByName(tracks.clickCurrentPhaseButton);
        const currentPhase = getCurrentPhase(phases);
        selectPhase(currentPhase);
      }
    }, [phases]);

    if (!isNilOrError(locale) && !isNilOrError(phases) && phases.length > 1) {
      const navButtonSize = '34px';
      const navButtonStyle = buttonStyle || 'secondary';
      const selectedPhaseId = selectedPhase ? selectedPhase.id : null;
      const currentPhase = getCurrentPhase(phases);
      const currentPhaseId = currentPhase ? currentPhase.id : null;

      return (
        <Container
          className={`e2e-timeline-phase-navigation ${className || ''}`}
        >
          <Tippy
            disabled={selectedPhaseId === phases[0].id}
            interactive={false}
            placement="bottom"
            content={formatMessage(messages.previousPhase)}
            theme="translucent"
            arrow={false}
            hideOnClick={true}
          >
            <div>
              <PreviousPhaseButton
                locale={locale}
                onClick={goToPreviousPhase}
                icon="chevron-left"
                iconSize="12px"
                iconColor={colors.label}
                buttonStyle={navButtonStyle}
                width={navButtonSize}
                height={navButtonSize}
                padding="0px"
                disabled={selectedPhaseId === phases[0].id}
                ariaLabel={formatMessage(messages.previousPhase)}
                className="e2e-previous-phase"
              />
            </div>
          </Tippy>
          {currentPhaseId && (
            <Tippy
              disabled={selectedPhaseId === currentPhaseId}
              interactive={false}
              placement="bottom"
              content={formatMessage(messages.currentPhase)}
              theme="translucent"
              arrow={false}
              hideOnClick={true}
            >
              <div>
                <CurrentPhaseButton
                  locale={locale}
                  onClick={goToCurrentPhase}
                  icon="dot"
                  iconSize="8px"
                  iconColor={colors.clGreen}
                  buttonStyle={navButtonStyle}
                  width={navButtonSize}
                  height={navButtonSize}
                  padding="0px"
                  disabled={selectedPhaseId === currentPhaseId}
                  ariaLabel={formatMessage(messages.currentPhase)}
                  className="e2e-current-phase"
                />
              </div>
            </Tippy>
          )}
          <Tippy
            disabled={selectedPhaseId === phases[phases.length - 1].id}
            interactive={false}
            placement="bottom"
            content={formatMessage(messages.nextPhase)}
            theme="translucent"
            arrow={false}
            hideOnClick={true}
          >
            <div>
              <NextPhaseButton
                locale={locale}
                onClick={goToNextPhase}
                icon="chevron-right"
                iconSize="12px"
                iconColor={colors.label}
                buttonStyle={navButtonStyle}
                width={navButtonSize}
                height={navButtonSize}
                padding="0px"
                disabled={selectedPhaseId === phases[phases.length - 1].id}
                ariaLabel={formatMessage(messages.nextPhase)}
              />
            </div>
          </Tippy>
        </Container>
      );
    }

    return null;
  }
);

export default injectIntl(PhaseNavigation);
