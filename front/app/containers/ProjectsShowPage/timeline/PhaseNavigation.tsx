import React, { memo, useCallback, useMemo } from 'react';

import {
  Button,
  colors,
  isRtl,
  Tooltip,
} from '@citizenlab/cl2-component-library';
import { findIndex } from 'lodash-es';
import { useParams } from 'utils/router';
import styled from 'styled-components';

import { IPhaseData } from 'api/phases/types';
import usePhases from 'api/phases/usePhases';
import { getCurrentPhase, getLatestRelevantPhase } from 'api/phases/utils';
import useProjectById from 'api/projects/useProjectById';

import useFeatureFlag from 'hooks/useFeatureFlag';

import messages from 'containers/ProjectsShowPage/messages';

import { trackEventByName } from 'utils/analytics';
import { useIntl } from 'utils/cl-intl';

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
  buttonStyle?: 'secondary-outlined' | 'white';
  className?: string;
}

const PhaseNavigation = memo<Props>(({ projectId, buttonStyle, className }) => {
  const { formatMessage } = useIntl();
  const { data: phases } = usePhases(projectId);
  const { phaseNumber } = useParams({ strict: false });
  const { data: project } = useProjectById(projectId);
  const phaseInsightsEnabled = useFeatureFlag({ name: 'phase_insights' });

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
      setPhaseURL(
        phase,
        phases.data,
        project.data,
        undefined,
        phaseInsightsEnabled
      );
    },
    [phases, project, phaseInsightsEnabled]
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
    const navButtonStyle = buttonStyle || 'secondary-outlined';
    const selectedPhaseId = selectedPhase ? selectedPhase.id : null;
    const currentPhase = getCurrentPhase(phases.data);
    const currentPhaseId = currentPhase ? currentPhase.id : null;

    return (
      <Container className={`e2e-timeline-phase-navigation ${className || ''}`}>
        <Tooltip
          disabled={selectedPhaseId === phases.data[0].id}
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
              borderColor={colors.grey700}
            />
          </div>
        </Tooltip>
        {currentPhaseId && (
          <Tooltip
            disabled={selectedPhaseId === currentPhaseId}
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
                iconColor={colors.green500}
                buttonStyle={navButtonStyle}
                width={navButtonSize}
                height={navButtonSize}
                padding="0px"
                disabled={selectedPhaseId === currentPhaseId}
                ariaLabel={formatMessage(messages.currentPhase)}
                className="e2e-current-phase"
                borderColor={colors.grey700}
              />
            </div>
          </Tooltip>
        )}
        <Tooltip
          disabled={selectedPhaseId === phases.data[phases.data.length - 1].id}
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
              borderColor={colors.grey700}
            />
          </div>
        </Tooltip>
      </Container>
    );
  }

  return null;
});

export default PhaseNavigation;
