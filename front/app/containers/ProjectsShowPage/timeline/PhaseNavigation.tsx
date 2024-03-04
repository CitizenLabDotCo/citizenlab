import React, { memo, useCallback, useMemo } from 'react';

import { Button, colors, isRtl } from '@citizenlab/cl2-component-library';
import Tippy from '@tippyjs/react';
import messages from 'containers/ProjectsShowPage/messages';
import { findIndex } from 'lodash-es';
import { WrappedComponentProps } from 'react-intl';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

import { trackEventByName } from 'utils/analytics';
import { injectIntl } from 'utils/cl-intl';

import { IPhaseData } from 'api/phases/types';
import usePhases from 'api/phases/usePhases';
import { getCurrentPhase, getLatestRelevantPhase } from 'api/phases/utils';
import useProjectById from 'api/projects/useProjectById';

import { isValidPhase } from '../phaseParam';

import setPhaseURL from './setPhaseURL';
import tracks from './tracks';

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

const PhaseNavigation = memo<Props & WrappedComponentProps>(
  ({ projectId, buttonStyle, className, intl: { formatMessage } }) => {
    const { data: phases } = usePhases(projectId);
    const { phaseNumber } = useParams();
    const { data: project } = useProjectById(projectId);

    const selectedPhase = useMemo(() => {
      if (!phases) return;

      // if a phase parameter was provided, and it is valid, we set that as phase.
      // otherwise, use the most logical phase
      if (isValidPhase(phaseNumber, phases.data)) {
        const phaseIndex = Number(phaseNumber) - 1;
        return phases.data[phaseIndex];
      }

      return getLatestRelevantPhase(phases.data);
    }, [phaseNumber, phases]);

    const selectPhase = useCallback(
      (phase: IPhaseData) => {
        if (!phases || !project) return;
        setPhaseURL(phase, phases.data, project.data);
      },
      [phases, project]
    );

    const goToNextPhase = useCallback(() => {
      trackEventByName(tracks.clickNextPhaseButton);

      if (phases) {
        const selectedPhaseId = selectedPhase ? selectedPhase.id : null;
        const selectedPhaseIndex = findIndex(
          phases.data,
          (phase) => phase.id === selectedPhaseId
        );
        const nextPhaseIndex =
          phases.data.length >= selectedPhaseIndex + 2
            ? selectedPhaseIndex + 1
            : 0;
        const nextPhase = phases.data[nextPhaseIndex];
        selectPhase(nextPhase);
      }
    }, [phases, selectedPhase, selectPhase]);

    const goToPreviousPhase = useCallback(() => {
      trackEventByName(tracks.clickPreviousPhaseButton);

      if (phases) {
        const selectedPhaseId = selectedPhase ? selectedPhase.id : null;
        const selectedPhaseIndex = findIndex(
          phases.data,
          (phase) => phase.id === selectedPhaseId
        );
        const prevPhaseIndex =
          selectedPhaseIndex > 0
            ? selectedPhaseIndex - 1
            : phases.data.length - 1;
        const prevPhase = phases.data[prevPhaseIndex];
        selectPhase(prevPhase);
      }
    }, [phases, selectedPhase, selectPhase]);

    const goToCurrentPhase = useCallback(() => {
      if (phases) {
        trackEventByName(tracks.clickCurrentPhaseButton);
        const currentPhase = getCurrentPhase(phases.data);

        if (currentPhase) {
          selectPhase(currentPhase);
        }
      }
    }, [phases, selectPhase]);

    if (phases && phases.data.length > 1) {
      const navButtonSize = '34px';
      const navButtonStyle = buttonStyle || 'secondary';
      const selectedPhaseId = selectedPhase ? selectedPhase.id : null;
      const currentPhase = getCurrentPhase(phases.data);
      const currentPhaseId = currentPhase ? currentPhase.id : null;

      return (
        <Container
          className={`e2e-timeline-phase-navigation ${className || ''}`}
        >
          <Tippy
            disabled={selectedPhaseId === phases.data[0].id}
            interactive={false}
            placement="bottom"
            content={formatMessage(messages.previousPhase)}
            theme="translucent"
            arrow={false}
            hideOnClick={true}
          >
            <div>
              <PreviousPhaseButton
                onClick={goToPreviousPhase}
                icon="chevron-left"
                iconColor={colors.textSecondary}
                buttonStyle={navButtonStyle}
                width={navButtonSize}
                height={navButtonSize}
                padding="0px"
                disabled={selectedPhaseId === phases.data[0].id}
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
                <Button
                  onClick={goToCurrentPhase}
                  icon="dot"
                  iconSize="16px"
                  iconColor={colors.success}
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
            disabled={
              selectedPhaseId === phases.data[phases.data.length - 1].id
            }
            interactive={false}
            placement="bottom"
            content={formatMessage(messages.nextPhase)}
            theme="translucent"
            arrow={false}
            hideOnClick={true}
          >
            <div>
              <NextPhaseButton
                onClick={goToNextPhase}
                icon="chevron-right"
                iconColor={colors.textSecondary}
                buttonStyle={navButtonStyle}
                width={navButtonSize}
                height={navButtonSize}
                padding="0px"
                disabled={
                  selectedPhaseId === phases.data[phases.data.length - 1].id
                }
                ariaLabel={formatMessage(messages.nextPhase)}
                className="e2e-next-phase"
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
