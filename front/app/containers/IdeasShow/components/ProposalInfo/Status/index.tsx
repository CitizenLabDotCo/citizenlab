import React from 'react';

import {
  Box,
  colors,
  fontSizes,
  stylingConsts,
} from '@citizenlab/cl2-component-library';
import styled, { useTheme } from 'styled-components';

import { IIdeaStatusData } from 'api/idea_statuses/types';
import { IIdeaData } from 'api/ideas/types';

import ReactionControl from 'components/ReactionControl';
import T from 'components/T';

import { ScreenReaderOnly } from 'utils/a11y';
import { FormattedMessage } from 'utils/cl-intl';

import messages from '../messages';

import CountDown from './components/CountDown';
import ReactionCounter from './components/ReactionCounter';
import ReadAnswerButton from './components/ReadAnswerButton';

export const StatusHeading = styled.h2`
  display: flex;
  font-size: ${fontSizes.base}px;
  font-weight: bold;
  text-transform: capitalize;
`;

interface Props {
  compact?: boolean;
  onScrollToOfficialFeedback?: () => void;
  idea: IIdeaData;
  ideaStatus: IIdeaStatusData;
}

const Status = ({
  onScrollToOfficialFeedback,
  idea,
  ideaStatus,
  compact = false,
}: Props) => {
  const theme = useTheme();
  const { code } = ideaStatus.attributes;

  const showCountDown =
    code === 'proposed' || code === 'expired' || code === 'custom';

  const showProgressBar =
    code === 'proposed' ||
    code === 'threshold_reached' ||
    code === 'custom' ||
    code === 'ineligible' ||
    code === 'answered';

  const showReadAnswerButton = code === 'answered' || code === 'ineligible';

  const showVoteButtons =
    code === 'proposed' ||
    code === 'threshold_reached' ||
    code === 'custom' ||
    code === 'answered';

  return (
    <Box
      display="flex"
      flexDirection="column"
      borderRadius={stylingConsts.borderRadius}
    >
      {showCountDown && (
        <Box ml="auto" mb="24px">
          <ScreenReaderOnly>
            <FormattedMessage {...messages.a11y_timeLeft} />
          </ScreenReaderOnly>
          {idea.attributes.expires_at && (
            <CountDown targetTime={idea.attributes.expires_at} />
          )}
        </Box>
      )}
      <Box display="flex" mb="16px" alignItems="center">
        <StatusHeading>
          <T value={ideaStatus.attributes.title_multiloc} />
        </StatusHeading>
      </Box>
      <Box mb="24px" aria-live="polite">
        {/* <StatusExplanation>{statusExplanation}</StatusExplanation> */}
      </Box>
      {showProgressBar && (
        <Box mb="24px">
          <ReactionCounter
            idea={idea}
            barColor={theme.colors.tenantPrimary || colors.success}
          />
        </Box>
      )}
      {showVoteButtons && !compact && (
        <Box mb="8px">
          <ReactionControl
            styleType="shadow"
            ideaId={idea.id}
            size="4"
            variant="text"
          />
        </Box>
      )}
      {showReadAnswerButton && onScrollToOfficialFeedback && (
        <Box mb="8px">
          <ReadAnswerButton onClick={onScrollToOfficialFeedback} />
        </Box>
      )}
    </Box>
  );
};

export default Status;
