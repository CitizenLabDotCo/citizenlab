import React from 'react';

import { Box, media, fontSizes } from '@citizenlab/cl2-component-library';
import { darken, rgba } from 'polished';
import styled from 'styled-components';

import { IPhase } from 'api/phases/types';
import { IProject } from 'api/projects/types';

import useLocalize from 'hooks/useLocalize';

import { useIntl } from 'utils/cl-intl';

import { TProjectCardSize } from '../types';

import { ContentHeaderBottomMargin, ContentHeaderHeight } from './constants';
import CountDown from './CountDown';
import getCTAMessage from './getCTAMessage';

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  &.noContent {
    ${media.desktop`
      height: ${ContentHeaderHeight + ContentHeaderBottomMargin}px;
    `}
  }

  &.hasRightContent.noLeftContent {
    justify-content: flex-end;
  }

  &.hasContent {
    margin-bottom: ${ContentHeaderBottomMargin}px;

    &.large {
      margin-bottom: 0px;
      padding-bottom: ${ContentHeaderBottomMargin}px;
      border-bottom: solid 1px #e0e0e0;
    }
  }

  &.small {
    padding-left: 30px;
    padding-right: 30px;

    ${media.phone`
      padding-left: 10px;
      padding-right: 10px;
    `}
  }
`;

const ProjectLabel = styled.button`
  color: ${({ theme }) => darken(0.05, theme.colors.tenantSecondary)};
  font-size: ${fontSizes.s}px;
  font-weight: 400;
  text-align: center;
  white-space: nowrap;
  padding: 8px 14px;
  border-radius: ${(props) => props.theme.borderRadius};
  border: 1px solid ${({ theme }) => darken(0.05, theme.colors.tenantSecondary)};
  background: transparent;
  transition: all 0.3s ease;

  &:hover {
    background: ${({ theme }) => rgba(theme.colors.tenantSecondary, 0.1)};
    color: ${({ theme }) => theme.colors.tenantSecondary};
    border-color: ${({ theme }) => theme.colors.tenantSecondary};
    cursor: pointer;
  }
`;

interface Props {
  project: IProject;
  phase?: IPhase;
  size: TProjectCardSize;
  visible: boolean;
  progressBarRef: (node?: Element | null) => void;
  onClickCTA: (projectId: string) => void;
}

const ContentHeader = ({
  project,
  phase,
  size,
  visible,
  progressBarRef,
  onClickCTA,
}: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();

  const ctaMessage = phase
    ? getCTAMessage({
        actionDescriptors: project.data.attributes.action_descriptors,
        phase: phase.data,
        formatMessage,
        localize,
      })
    : undefined;

  const isFinished = project.data.attributes.timeline_active === 'past';
  const isArchived = project.data.attributes.publication_status === 'archived';

  const showCountDown =
    isFinished || isArchived || !!phase?.data.attributes.end_at;

  return (
    <Container
      className={`${size} ${
        !ctaMessage ? 'noRightContent' : 'hasContent hasRightContent'
      } ${!showCountDown ? 'noLeftContent' : 'hasContent hasLeftContent'} ${
        !ctaMessage && !showCountDown ? 'noContent' : ''
      }`}
    >
      {showCountDown && (
        <Box
          className={size}
          minHeight={`${ContentHeaderHeight}px`}
          display="flex"
          flexGrow={0}
          flexShrink={1}
          flexBasis={140}
          mr="15px"
        >
          <CountDown
            project={project}
            phase={phase}
            progressBarRef={progressBarRef}
            visible={visible}
          />
        </Box>
      )}

      {ctaMessage && !isFinished && !isArchived && (
        <Box
          minHeight={`${ContentHeaderHeight}px`}
          className={`${size} ${showCountDown ? 'hasProgressBar' : ''}`}
        >
          <ProjectLabel
            onClick={() => {
              onClickCTA(project.data.id);
            }}
            className="e2e-project-card-cta"
          >
            {ctaMessage}
          </ProjectLabel>
        </Box>
      )}
    </Container>
  );
};

export default ContentHeader;
