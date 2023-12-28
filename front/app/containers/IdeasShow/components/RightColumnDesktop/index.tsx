import React from 'react';

// hooks
import usePhases from 'api/phases/usePhases';
import useIdeaById from 'api/ideas/useIdeaById';
import useFeatureFlag from 'hooks/useFeatureFlag';

// components
import { Box, colors } from '@citizenlab/cl2-component-library';
import MetaInformation from '../MetaInformation';
import ReactionControl from 'components/ReactionControl';
import IdeaSharingButton from '../Buttons/IdeaSharingButton';
import SharingButtonComponent from '../Buttons/SharingButtonComponent';
import FollowUnfollow from 'components/FollowUnfollow';
import GoToCommentsButton from '../Buttons/GoToCommentsButton';

// styling
import { rightColumnWidthDesktop } from '../../styleConstants';

// utils
import { getVotingMethodConfig } from 'utils/configs/votingMethodConfig';
import {
  getCurrentPhase,
  isIdeaInParticipationContext,
} from 'api/phases/utils';
import { isFixableByAuthentication } from 'utils/actionDescriptors';

interface Props {
  ideaId: string;
  projectId: string;
  statusId: string;
  authorId: string | null;
  className?: string;
}

const RightColumnDesktop = ({
  ideaId,
  projectId,
  statusId,
  authorId,
  className,
}: Props) => {
  const { data: phases } = usePhases(projectId);
  const { data: idea } = useIdeaById(ideaId);
  const followEnabled = useFeatureFlag({
    name: 'follow',
  });

  if (!idea) return null;

  const phase = getCurrentPhase(phases?.data);
  const votingConfig = getVotingMethodConfig(phase?.attributes.voting_method);

  const ideaIsInParticipationContext =
    phase && idea ? isIdeaInParticipationContext(idea, phase) : undefined;

  const commentingEnabled =
    !!idea?.data.attributes.action_descriptor.commenting_idea.enabled;

  // showReactionControl
  const reactingActionDescriptor =
    idea.data.attributes.action_descriptor.reacting_idea;
  const reactingFutureEnabled = !!(
    reactingActionDescriptor.up.future_enabled ||
    reactingActionDescriptor.down.future_enabled
  );
  const cancellingEnabled = reactingActionDescriptor.cancelling_enabled;
  const likesCount = idea.data.attributes.likes_count;
  const dislikesCount = idea.data.attributes.dislikes_count;
  const showReactionControl =
    phase?.attributes.participation_method !== 'voting' &&
    (reactingActionDescriptor.enabled ||
      isFixableByAuthentication(reactingActionDescriptor.disabled_reason) ||
      cancellingEnabled ||
      reactingFutureEnabled ||
      likesCount > 0 ||
      dislikesCount > 0);

  const showInteractionsContainer =
    ideaIsInParticipationContext || commentingEnabled || followEnabled;

  return (
    <Box
      flex={`0 0 ${rightColumnWidthDesktop}px`}
      width={`${rightColumnWidthDesktop}px`}
      position="sticky"
      top="110px"
      alignSelf="flex-start"
      className={className}
    >
      <Box display="flex" flexDirection="column">
        {showInteractionsContainer && (
          <Box
            padding="20px"
            borderRadius="3px"
            background={colors.background}
            mb="12px"
          >
            {(ideaIsInParticipationContext || commentingEnabled) && (
              <>
                {showReactionControl && (
                  <Box pb="23px" mb="23px">
                    <ReactionControl
                      styleType="shadow"
                      ideaId={ideaId}
                      size="4"
                    />
                  </Box>
                )}
                <Box pb="23px" mb="23px" borderBottom="solid 1px #ccc">
                  {phase &&
                    ideaIsInParticipationContext &&
                    votingConfig?.getIdeaPageVoteInput({
                      ideaId,
                      phase,
                      compact: false,
                    })}
                </Box>
                {commentingEnabled && (
                  <Box mb="10px">
                    <GoToCommentsButton />
                  </Box>
                )}
              </>
            )}
            <FollowUnfollow
              followableType="ideas"
              followableId={ideaId}
              followersCount={idea.data.attributes.followers_count}
              followerId={idea.data.relationships.user_follower?.data?.id}
            />
          </Box>
        )}
        <Box mb="16px">
          <IdeaSharingButton
            ideaId={ideaId}
            buttonComponent={<SharingButtonComponent />}
          />
        </Box>
        <Box mb="40px">
          <MetaInformation
            ideaId={ideaId}
            projectId={projectId}
            statusId={statusId}
            authorId={authorId}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default RightColumnDesktop;
