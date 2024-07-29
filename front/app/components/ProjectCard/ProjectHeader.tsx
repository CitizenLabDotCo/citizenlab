import React, { useState } from 'react';

import { Box, fontSizes, colors } from '@citizenlab/cl2-component-library';
import { round } from 'lodash-es';
import moment from 'moment';
import { rgba, darken } from 'polished';
import { useInView } from 'react-intersection-observer';
import styled from 'styled-components';

import { InputTerm, IPhase } from 'api/phases/types';
import { IProject } from 'api/projects/types';

import { FormattedMessage } from 'utils/cl-intl';

import CTAMessage from './CTAMessage';
import { handleCTAOnClick } from './Helpers';
import messages from './messages';

export const ContentHeaderHeight = 39;
export const ContentHeaderBottomMargin = 13;

const TimeRemaining = styled.div`
  color: ${({ theme }) => theme.colors.tenantText};
  font-size: ${fontSizes.s}px;
  font-weight: 400;
  margin-bottom: 7px;
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

const ContentHeaderLabel = styled.span`
  height: ${ContentHeaderHeight}px;
  color: ${colors.textSecondary};
  font-size: ${fontSizes.s}px;
  font-weight: 500;
  text-transform: uppercase;
  display: flex;
  align-items: center;
`;

const ProjectLabel = styled.div`
  // darkened to have higher chances of solid color contrast
  color: ${({ theme }) => darken(0.05, theme.colors.tenantSecondary)};
  font-size: ${fontSizes.s}px;
  font-weight: 400;
  text-align: center;
  white-space: nowrap;
  padding-left: 14px;
  padding-right: 14px;
  padding-top: 8px;
  padding-bottom: 8px;
  border-radius: ${(props) => props.theme.borderRadius};
  background: ${({ theme }) => rgba(theme.colors.tenantSecondary, 0.1)};
`;

interface Props {
  phase: IPhase | undefined;
  inputTerm: InputTerm;
  project: IProject;
  ContentHeaderComponent: React.ComponentType<{
    className?: string;
    children?: React.ReactNode;
  }>;
}

const ProjectHeader = ({
  phase,
  inputTerm,
  project,
  ContentHeaderComponent,
}: Props) => {
  const [visible, setVisible] = useState(false);
  const { ref: progressBarRef } = useInView({
    onChange: (inView) => {
      if (inView) {
        setVisible(true);
      }
    },
  });
  const startAt = phase?.data.attributes.start_at;
  const endAt = phase?.data.attributes.end_at;
  const isArchived = project.data.attributes.publication_status === 'archived';
  const isFinished = project.data.attributes.timeline_active === 'past';
  const timeRemaining = endAt
    ? moment.duration(moment(endAt).endOf('day').diff(moment())).humanize()
    : null;
  let countdown: JSX.Element | null = null;

  if (isArchived) {
    countdown = (
      <ContentHeaderLabel>
        <FormattedMessage {...messages.archived} />
      </ContentHeaderLabel>
    );
  } else if (isFinished) {
    countdown = (
      <ContentHeaderLabel>
        <FormattedMessage {...messages.finished} />
      </ContentHeaderLabel>
    );
  } else if (timeRemaining) {
    const totalDays = moment
      .duration(moment(endAt).diff(moment(startAt)))
      .asDays();
    const pastDays = moment
      .duration(moment(moment()).diff(moment(startAt)))
      .asDays();
    const progress = round((pastDays / totalDays) * 100, 1);
    countdown = (
      <Box mt="4px" className="e2e-project-card-time-remaining">
        <TimeRemaining>
          <FormattedMessage
            {...messages.remaining}
            values={{ timeRemaining }}
          />
        </TimeRemaining>
        <ProgressBar ref={progressBarRef} aria-hidden>
          <ProgressBarOverlay
            progress={progress}
            className={visible ? 'visible' : ''}
          />
        </ProgressBar>
      </Box>
    );
  }

  const ctaMessage = (
    <CTAMessage phase={phase} inputTerm={inputTerm} project={project} />
  );

  return (
    <ContentHeaderComponent
      className={`${!ctaMessage ? undefined : 'hasContent hasRightContent'} ${
        !countdown ? 'noLeftContent' : 'hasContent hasLeftContent'
      } ${!ctaMessage && !countdown ? 'noContent' : ''}`}
    >
      {countdown && (
        <Box
          minHeight={`${ContentHeaderHeight}px`}
          display="flex"
          flexGrow={0}
          flexShrink={1}
          flexBasis={140}
          mr="15px"
        >
          {countdown}
        </Box>
      )}

      {ctaMessage && !isFinished && !isArchived && (
        <Box minHeight={`${ContentHeaderHeight}px`} className="hasProgressBar">
          <ProjectLabel
            onClick={() => {
              handleCTAOnClick(project.data.id);
            }}
            className="e2e-project-card-cta"
          >
            {ctaMessage}
          </ProjectLabel>
        </Box>
      )}
    </ContentHeaderComponent>
  );
};

export default ProjectHeader;
