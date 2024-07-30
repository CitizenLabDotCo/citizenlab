import React from 'react';

import { Box, colors, Icon, Text } from '@citizenlab/cl2-component-library';
import { useTheme } from 'styled-components';

import { IIdeaData } from 'api/ideas/types';

import StatusBadge from 'components/StatusBadge';
import ProgressBar from 'components/UI/ProgressBar';

import { ScreenReaderOnly } from 'utils/a11y';
import { FormattedMessage } from 'utils/cl-intl';

import messages from '../messages';

import CommentCount from './CommentCount';

const ProposalFooter = ({
  reactionCount,
  reactionLimit,
  showCommentCount,
  idea,
  hideIdeaStatus,
}: {
  reactionCount: number;
  reactionLimit?: number;
  showCommentCount: boolean;
  idea: IIdeaData;
  hideIdeaStatus?: boolean;
}) => {
  const ideaStatusId = idea.relationships.idea_status.data?.id;
  const theme = useTheme();
  if (!reactionLimit) {
    return null;
  }
  return (
    <>
      <Box display="flex" gap="16px" alignItems="center">
        <Box flex={'1'}>
          <Box display="flex" alignItems="center" mb="4px">
            <Icon
              name="vote-up"
              ariaHidden
              fill={colors.textSecondary}
              mr="8px"
              width="20px"
              height="20px"
            />
            <Text aria-hidden fontSize="s" color="textSecondary" m="0px">
              <Text as="span" color="tenantPrimary" fontWeight="bold" m="0px">
                {reactionCount}
              </Text>
              <span className="division-bar"> / </span>
              {reactionLimit}
            </Text>
          </Box>
          <ProgressBar
            progress={reactionCount / reactionLimit}
            color={
              theme.colors.tenantText ||
              'linear-gradient(270deg, #DE7756 -30.07%, #FF672F 100%)'
            }
            bgColor={colors.grey200}
          />

          <ScreenReaderOnly>
            <FormattedMessage
              {...messages.xVotesOfY}
              values={{
                xVotes: reactionCount,
                votingThreshold: reactionLimit,
              }}
            />
          </ScreenReaderOnly>
        </Box>
        <Box>
          {showCommentCount && (
            <CommentCount commentCount={idea.attributes.comments_count} />
          )}
        </Box>
        <Box maxWidth="50%">
          {!hideIdeaStatus && ideaStatusId && (
            <StatusBadge statusId={ideaStatusId} />
          )}
        </Box>
      </Box>
    </>
  );
};

export default ProposalFooter;
