import React from 'react';

import { Box, colors, Divider } from '@citizenlab/cl2-component-library';
import { useTheme } from 'styled-components';

import useIdeaById from 'api/ideas/useIdeaById';
import usePhases from 'api/phases/usePhases';
import {
  getCurrentPhase,
  isIdeaInParticipationContext,
} from 'api/phases/utils';

import useFeatureFlag from 'hooks/useFeatureFlag';

import FollowUnfollow from 'components/FollowUnfollow';
import ReactionControl from 'components/ReactionControl';
import { showIdeationReactions } from 'components/ReactionControl/utils';

import { getVotingMethodConfig } from 'utils/configs/votingMethodConfig';

import { rightColumnWidthDesktop } from '../../styleConstants';
import GoToCommentsButton from '../Buttons/GoToCommentsButton';
import IdeaSharingButton from '../Buttons/IdeaSharingButton';
import SharingButtonComponent from '../Buttons/SharingButtonComponent';
import Cosponsorship from '../Cosponsorship';
import MetaInformation from '../MetaInformation';
import ProposalInfo from '../ProposalInfo';

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
  const theme = useTheme();
  const { data: phases } = usePhases(projectId);
  const { data: idea } = useIdeaById(ideaId);
  const followEnabled = useFeatureFlag({
    name: 'follow',
  });

  if (!idea) return null;

  const phase = getCurrentPhase(phases?.data);
  const votingConfig = getVotingMethodConfig(phase?.attributes.voting_method);

  const ideaIsInParticipationContext = phase
    ? isIdeaInParticipationContext(idea.data, phase)
    : undefined;

  const commentingEnabled =
    idea.data.attributes.action_descriptors.commenting_idea.enabled;

  const participationMethod = phase?.attributes.participation_method;

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
        {showInteractionsContainer && participationMethod && (
          <Box
            padding="20px"
            borderRadius={theme.borderRadius}
            background={colors.background}
            mb="12px"
          >
            {participationMethod === 'proposals' && (
              <>
                <Box
                  p="12px"
                  bg={colors.white}
                  borderRadius={theme.borderRadius}
                >
                  <ProposalInfo idea={idea} />
                </Box>
                <Divider />
              </>
            )}
            {participationMethod === 'ideation' &&
              showIdeationReactions(idea.data, participationMethod) && (
                <>
                  <ReactionControl
                    styleType="shadow"
                    ideaId={ideaId}
                    size="4"
                  />
                  <Divider />
                </>
              )}
            {participationMethod === 'voting' &&
              ideaIsInParticipationContext &&
              votingConfig && (
                <Box pb="24px" mb="24px" borderBottom="solid 1px #ccc">
                  {votingConfig.getIdeaPageVoteInput({
                    ideaId,
                    phase,
                    compact: false,
                  })}
                </Box>
              )}
            {commentingEnabled && (
              <Box mb="12px">
                <GoToCommentsButton />
              </Box>
            )}
            <FollowUnfollow
              followableType="ideas"
              followableId={ideaId}
              followersCount={idea.data.attributes.followers_count}
              // TODO: Fix this the next time the file is edited.
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
              followerId={idea.data.relationships.user_follower?.data?.id}
              toolTipType="input"
            />
          </Box>
        )}
        <Cosponsorship ideaId={ideaId} />

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
