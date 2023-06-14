import React, { useCallback } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// hooks
import useProjectById from 'api/projects/useProjectById';
import useAuthUser from 'api/me/useAuthUser';

// i18n
import useLocalize from 'hooks/useLocalize';

// components
import VoteControl from 'components/VoteControl';
import GoBackButtonSolid from 'components/UI/GoBackButton/GoBackButtonSolid';

// events
import { triggerAuthenticationFlow } from 'containers/Authentication/events';
import eventEmitter from 'utils/eventEmitter';

// routing
import clHistory from 'utils/cl-router/history';

// styling
import styled from 'styled-components';
import { media, colors } from 'utils/styleUtils';
import { lighten } from 'polished';

// utils
import { isFixableByAuthentication } from 'utils/actionDescriptors';

// typings
import { IdeaVotingDisabledReason } from 'api/ideas/types';
import { useBreakpoint } from '@citizenlab/cl2-component-library';

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
  const { data: authUser } = useAuthUser();
  const { data: project } = useProjectById(projectId);

  const localize = useLocalize();
  const isSmallerThanTablet = useBreakpoint('tablet');

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

  const handleGoBack = useCallback(() => {
    if (insideModal) {
      eventEmitter.emit('closeIdeaModal');
      return;
    }

    if (deselectIdeaOnMap) {
      deselectIdeaOnMap();
      return;
    }

    if (!project) return;
    clHistory.push(`/projects/${project.data.attributes.slug}`);
  }, [insideModal, deselectIdeaOnMap, project]);

  return (
    <Container className={className || ''}>
      <TopBarInner>
        <Left>
          <GoBackButtonSolid
            text={
              project ? localize(project.data.attributes.title_multiloc) : ''
            }
            iconSize={isSmallerThanTablet ? '42px' : undefined}
            onClick={handleGoBack}
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
