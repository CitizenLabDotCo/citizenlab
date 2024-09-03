import React from 'react';

import { Box, colors, Icon, Text } from '@citizenlab/cl2-component-library';
import styled, { useTheme } from 'styled-components';

import { IIdeaData } from 'api/ideas/types';

import StatusBadge from 'components/StatusBadge';
import ProgressBar from 'components/UI/ProgressBar';

import { ScreenReaderOnly } from 'utils/a11y';
import { FormattedMessage } from 'utils/cl-intl';

import messages from '../messages';

import CommentCount from './CommentCount';

const StyledProgressBar = styled(ProgressBar)`
  border-radius: ${(props) => props.theme.borderRadius};
  border: ${(props) =>
    props.bgShaded ? 'none' : `1px solid ${props.theme.colors.tenantPrimary}`};
`;

const ProposalFooter = ({
  showCommentCount,
  idea,
  hideIdeaStatus,
}: {
  showCommentCount?: boolean;
  idea: IIdeaData;
  hideIdeaStatus?: boolean;
}) => {
  const ideaStatusId = idea.relationships.idea_status.data?.id;
  const theme = useTheme();
  const reactionCount = idea.attributes.likes_count;
  const reactionLimit = idea.attributes.reacting_threshold;

  return (
    <>
      <Box display="flex" gap="16px" alignItems="center">
        <Box minWidth="140px" width="40%">
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
          <StyledProgressBar
            progress={reactionLimit ? reactionCount / reactionLimit : 0}
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
        <Box
          display="flex"
          alignItems="center"
          justifyContent="flex-end"
          width="50%"
          gap="16px"
        >
          <Box>
            {showCommentCount && (
              <CommentCount commentCount={idea.attributes.comments_count} />
            )}
          </Box>
          <Box>
            {!hideIdeaStatus && ideaStatusId && (
              <StatusBadge statusId={ideaStatusId} maxLength={20} />
            )}
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default ProposalFooter;
