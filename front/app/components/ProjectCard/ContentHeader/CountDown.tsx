import React from 'react';

import {
  colors,
  fontSizes,
  Box,
  Text,
} from '@citizenlab/cl2-component-library';
import { round } from 'lodash-es';
import moment from 'moment';
import styled from 'styled-components';

import { IPhase } from 'api/phases/types';
import { IProject } from 'api/projects/types';

import PhaseTimeLeft from 'components/PhaseTimeLeft';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../messages';

import { ContentHeaderHeight } from './constants';

const ContentHeaderLabel = styled.span`
  height: ${ContentHeaderHeight}px;
  color: ${colors.textSecondary};
  font-size: ${fontSizes.s}px;
  font-weight: 500;
  text-transform: uppercase;
  display: flex;
  align-items: center;
`;

const ProgressBar = styled.div`
  width: 100%;
  max-width: 130px;
  height: 5px;
  border-radius: ${(props) => props.theme.borderRadius};
  background: #d6dade;
`;

const ProgressBarOverlay = styled.div<{ progress: number }>`
  width: 0px;
  height: 100%;
  border-radius: ${(props) => props.theme.borderRadius};
  background: ${colors.error};
  transition: width 1000ms cubic-bezier(0.19, 1, 0.22, 1);
  will-change: width;

  &.visible {
    width: ${(props) => props.progress}%;
  }
`;

interface Props {
  project: IProject;
  phase?: IPhase;
  progressBarRef: (node?: Element | null) => void;
  visible: boolean;
}

const CountDown = ({ project, phase, progressBarRef, visible }: Props) => {
  const isFinished = project.data.attributes.timeline_active === 'past';
  const isArchived = project.data.attributes.publication_status === 'archived';

  const startAt = phase?.data.attributes.start_at;
  const endAt = phase?.data.attributes.end_at;

  if (isArchived) {
    return (
      <ContentHeaderLabel>
        <FormattedMessage {...messages.archived} />
      </ContentHeaderLabel>
    );
  } else if (isFinished) {
    return (
      <ContentHeaderLabel>
        <FormattedMessage {...messages.finished} />
      </ContentHeaderLabel>
    );
  } else if (endAt) {
    const totalDays = moment
      .duration(moment(endAt).diff(moment(startAt)))
      .asDays();
    const pastDays = moment
      .duration(moment(moment()).diff(moment(startAt)))
      .asDays();
    const progress =
      // number between 0 and 100
      round((pastDays / totalDays) * 100, 1);
    return (
      <Box mt="4px" className="e2e-project-card-time-remaining">
        <Text color="textPrimary" fontSize="s" m="0">
          <PhaseTimeLeft currentPhaseEndsAt={endAt} />
        </Text>
        <ProgressBar ref={progressBarRef} aria-hidden>
          <ProgressBarOverlay
            progress={progress}
            className={visible ? 'visible' : ''}
          />
        </ProgressBar>
      </Box>
    );
  }

  return null;
};

export default CountDown;
