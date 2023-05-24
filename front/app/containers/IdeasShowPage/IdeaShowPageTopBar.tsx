import React from 'react';
import { isNilOrError } from 'utils/helperUtils';

// hooks
import useProjectById from 'api/projects/useProjectById';
import useAuthUser from 'hooks/useAuthUser';

// components
import VoteControl from 'components/VoteControl';
import GoBackButton from 'containers/IdeasShow/GoBackButton';

// events
import { triggerAuthenticationFlow } from 'containers/Authentication/events';

// styling
import styled from 'styled-components';
import { media, colors } from 'utils/styleUtils';
import { lighten } from 'polished';

// utils
import { isFixableByAuthentication } from 'utils/actionDescriptors';

// typings
import { IdeaVotingDisabledReason } from 'api/ideas/types';

const Container = styled.div`
  flex: 0 0 ${(props) => props.theme.mobileTopBarHeight}px;
  height: ${(props) => props.theme.mobileTopBarHeight}px;
  background-color: #fff;
  border-bottom: solid 1px ${lighten(0.3, colors.textSecondary)};
`;

const TopBarInner = styled.div`
  height: 100%;
  padding-left: 15px;
  padding-right: 15px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;

  ${media.desktop`
    padding-left: 30px;
    padding-right: 30px;
  `}
`;

const Left = styled.div`
  height: 48px;
  align-items: center;
  display: flex;
`;

const Right = styled.div``;

interface Props {
  ideaId: string;
  projectId: string;
  insideModal: boolean;
  deselectIdeaOnMap?: () => void;
  className?: string;
}

const IdeaShowPageTopBar = ({
  ideaId,
  projectId,
  insideModal,
  className,
  deselectIdeaOnMap,
}: Props) => {
  const authUser = useAuthUser();
  const { data: project } = useProjectById(projectId);

  const onDisabledVoteClick = (disabled_reason: IdeaVotingDisabledReason) => {
    if (
      !isNilOrError(authUser) &&
      project &&
      isFixableByAuthentication(disabled_reason)
    ) {
      const pcType =
        project.data.attributes.process_type === 'continuous'
          ? 'project'
          : 'phase';
      const pcId =
        project.data.relationships?.current_phase?.data?.id || project.data.id;

      if (pcId && pcType) {
        triggerAuthenticationFlow({
          context: {
            action: 'voting_idea',
            id: pcId,
            type: pcType,
          },
        });
      }
    }
  };

  return (
    <Container className={className || ''}>
      <TopBarInner>
        <Left>
          <GoBackButton
            deselectIdeaOnMap={deselectIdeaOnMap}
            insideModal={insideModal}
            projectId={projectId}
          />
        </Left>
        <Right>
          <VoteControl
            size="1"
            styleType="border"
            ideaId={ideaId}
            disabledVoteClick={onDisabledVoteClick}
          />
        </Right>
      </TopBarInner>
    </Container>
  );
};

export default IdeaShowPageTopBar;
