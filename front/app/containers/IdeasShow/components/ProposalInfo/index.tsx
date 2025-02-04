import React from 'react';

import {
  Box,
  colors,
  fontSizes,
  stylingConsts,
  Text,
} from '@citizenlab/cl2-component-library';
import styled, { useTheme } from 'styled-components';

import useIdeaStatus from 'api/idea_statuses/useIdeaStatus';
import { IIdea } from 'api/ideas/types';

import ReactionControl from 'components/ReactionControl';
import { showProposalsReactions } from 'components/ReactionControl/utils';
import T from 'components/T';

import { ScreenReaderOnly } from 'utils/a11y';
import { FormattedMessage } from 'utils/cl-intl';

import CountDown from './components/CountDown';
import ReactionCounter from './components/ReactionCounter';
import messages from './messages';

export const StatusHeading = styled(Text)`
  font-size: ${fontSizes.base}px;
  font-weight: bold;
  text-transform: capitalize;
`;

interface Props {
  idea: IIdea;
  compact?: boolean;
}

const ProposalInfo = ({ idea, compact }: Props) => {
  const theme = useTheme();
  const { data: ideaStatus } = useIdeaStatus(
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    idea.data.relationships.idea_status?.data?.id || ''
  );

  if (!ideaStatus) return null;

  const { code } = ideaStatus.data.attributes;

  // All the codes checked for here are ProposalsStatusCode types (see front/app/api/idea_statuses/types.ts)
  const showCountDown =
    code === 'proposed' || code === 'expired' || code === 'custom';
  const showProgressBar =
    code === 'proposed' ||
    code === 'threshold_reached' ||
    code === 'custom' ||
    code === 'ineligible' ||
    code === 'answered';
  const showVoteButtons = showProposalsReactions(idea.data);

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
          {idea.data.attributes.expires_at && (
            <CountDown targetTime={idea.data.attributes.expires_at} />
          )}
        </Box>
      )}
      <Box display="flex" alignItems="center">
        <Box
          width="16px"
          height="16px"
          borderRadius={stylingConsts.borderRadius}
          bg={ideaStatus.data.attributes.color}
          mr="8px"
        />
        <StatusHeading>
          <T value={ideaStatus.data.attributes.title_multiloc} />
        </StatusHeading>
      </Box>
      <Box mb="24px" aria-live="polite">
        <Text m="0">
          <T value={ideaStatus.data.attributes.description_multiloc} />
        </Text>
      </Box>
      {showProgressBar && (
        <Box mb="24px">
          <ReactionCounter
            idea={idea.data}
            barColor={theme.colors.tenantPrimary || colors.success}
          />
        </Box>
      )}
      {/* 
        We already show ReactionControl via the top bar on mobile, hence we don't
        show it when compact is true.
      */}
      {showVoteButtons && !compact && (
        <ReactionControl
          styleType="shadow"
          ideaId={idea.data.id}
          size="4"
          variant="text"
        />
      )}
    </Box>
  );
};

export default ProposalInfo;
