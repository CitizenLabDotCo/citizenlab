import React from 'react';

import {
  Box,
  colors,
  fontSizes,
  stylingConsts,
  Text,
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

export const StatusHeading = styled(Text)`
  font-size: ${fontSizes.base}px;
  font-weight: bold;
  text-transform: capitalize;
`;

interface Props {
  compact?: boolean;
  idea: IIdeaData;
  ideaStatus: IIdeaStatusData;
}

const Status = ({ idea, ideaStatus, compact = false }: Props) => {
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
        <Box ml="auto">
          <ScreenReaderOnly>
            <FormattedMessage {...messages.a11y_timeLeft} />
          </ScreenReaderOnly>
          {idea.attributes.expires_at && (
            <CountDown targetTime={idea.attributes.expires_at} />
          )}
        </Box>
      )}
      <Box display="flex" alignItems="center">
        <Box
          width="16px"
          height="16px"
          borderRadius={stylingConsts.borderRadius}
          bg={ideaStatus.attributes.color}
          mr="8px"
        />
        <StatusHeading>
          <T value={ideaStatus.attributes.title_multiloc} />
        </StatusHeading>
      </Box>
      <Box mb="24px" aria-live="polite">
        <Text>
          <T value={ideaStatus.attributes.description_multiloc} />
        </Text>
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
        <ReactionControl
          styleType="shadow"
          ideaId={idea.id}
          size="4"
          variant="text"
        />
      )}
    </Box>
  );
};

export default Status;
