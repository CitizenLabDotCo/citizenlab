import React from 'react';

// api
import useProjectById from 'api/projects/useProjectById';
import usePhases from 'api/phases/usePhases';
import useIdeaById from 'api/ideas/useIdeaById';

// components
import { Box } from '@citizenlab/cl2-component-library';
import MetaInformation from '../MetaInformation';
import ReactionControl from 'components/ReactionControl';
import Buttons from 'containers/IdeasShow/components/CTABox/Buttons';
import IdeaSharingButton from '../Buttons/IdeaSharingButton';
import SharingButtonComponent from '../Buttons/SharingButtonComponent';

// styling
import styled from 'styled-components';
import { rightColumnWidthDesktop } from '../../styleConstants';
import { colors } from 'utils/styleUtils';

// utils
import { getVotingMethodConfig } from 'utils/configs/votingMethodConfig';
import {
  getCurrentParticipationContext,
  isIdeaInParticipationContext,
} from 'api/phases/utils';

const InnerContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledReactionControl = styled(ReactionControl)`
  padding-bottom: 23px;
  margin-bottom: 23px;
`;

const StyledMetaInformation = styled(MetaInformation)`
  margin-bottom: 40px;
`;

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
  const { data: project } = useProjectById(projectId);
  const { data: phases } = usePhases(projectId);
  const { data: idea } = useIdeaById(ideaId);

  const participationContext = getCurrentParticipationContext(
    project?.data,
    phases?.data
  );
  const votingConfig = getVotingMethodConfig(
    participationContext?.attributes.voting_method
  );

  const ideaIsInParticipationContext =
    participationContext && idea
      ? isIdeaInParticipationContext(idea, participationContext)
      : undefined;

  const commentingEnabled =
    !!idea?.data.attributes.action_descriptor.commenting_idea.enabled;

  const showGreyBox =
    participationContext?.attributes.participation_method !== 'voting' ||
    (participationContext && ideaIsInParticipationContext && votingConfig) ||
    commentingEnabled;

  return (
    <Box
      flex={`0 0 ${rightColumnWidthDesktop}px`}
      width={`${rightColumnWidthDesktop}px`}
      position="sticky"
      top="110px"
      alignSelf="flex-start"
      className={className}
    >
      <InnerContainer>
        {showGreyBox && (
          <Box
            padding="20px"
            borderRadius="3px"
            background={colors.background}
            mb="12px"
          >
            {participationContext?.attributes.participation_method !==
              'voting' && (
              <StyledReactionControl
                styleType="shadow"
                ideaId={ideaId}
                size="4"
              />
            )}
            <Box pb="23px" mb="23px" borderBottom="solid 1px #ccc">
              {participationContext &&
                ideaIsInParticipationContext &&
                votingConfig?.getIdeaPageVoteInput({
                  ideaId,
                  participationContext,
                  compact: false,
                })}
            </Box>
            {commentingEnabled && <Buttons />}
          </Box>
        )}
        <Box mb="16px">
          <IdeaSharingButton
            ideaId={ideaId}
            buttonComponent={<SharingButtonComponent />}
          />
        </Box>
        <StyledMetaInformation
          ideaId={ideaId}
          projectId={projectId}
          statusId={statusId}
          authorId={authorId}
        />
      </InnerContainer>
    </Box>
  );
};

export default RightColumnDesktop;
