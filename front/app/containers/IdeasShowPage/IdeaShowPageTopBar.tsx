import React, { useState, useCallback, useEffect } from 'react';

import {
  Box,
  useBreakpoint,
  media,
  colors,
} from '@citizenlab/cl2-component-library';
import { lighten } from 'polished';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';

import { IIdeaData } from 'api/ideas/types';
import useAuthUser from 'api/me/useAuthUser';
import { IPhaseData } from 'api/phases/types';
import { isIdeaInParticipationContext } from 'api/phases/utils';
import useProjectById from 'api/projects/useProjectById';

import { triggerAuthenticationFlow } from 'containers/Authentication/events';

import ReactionControl from 'components/ReactionControl';
import {
  showIdeationReactions,
  showProposalsReactions,
} from 'components/ReactionControl/utils';
import GoBackButtonSolid from 'components/UI/GoBackButton/GoBackButtonSolid';

import { isFixableByAuthentication } from 'utils/actionDescriptors';
import { IdeaReactingDisabledReason } from 'utils/actionDescriptors/types';
import clHistory from 'utils/cl-router/history';
import { removeSearchParams } from 'utils/cl-router/removeSearchParams';
import { getVotingMethodConfig } from 'utils/configs/votingMethodConfig';
import { isNilOrError } from 'utils/helperUtils';

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
  idea: IIdeaData;
  deselectIdeaOnMap?: () => void;
  className?: string;
  phase: IPhaseData | undefined;
}

const IdeaShowPageTopBar = ({
  idea,
  className,
  deselectIdeaOnMap,
  phase,
}: Props) => {
  const projectId = idea.relationships.project.data.id;
  const ideaId = idea.id;
  const { data: authUser } = useAuthUser();
  const { data: project } = useProjectById(projectId);
  const isSmallerThanTablet = useBreakpoint('tablet');

  const [searchParams] = useSearchParams();
  const [goBack] = useState(searchParams.get('go_back'));

  useEffect(() => {
    removeSearchParams(['go_back']);
  }, []);

  const onDisabledReactClick = (
    disabled_reason: IdeaReactingDisabledReason
  ) => {
    if (
      !isNilOrError(authUser) &&
      project &&
      isFixableByAuthentication(disabled_reason)
    ) {
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      const phaseId = project.data.relationships?.current_phase?.data?.id;
      if (phaseId) {
        triggerAuthenticationFlow({
          context: {
            action: 'reacting_idea',
            id: phaseId,
            type: 'phase',
          },
        });
      }
    }
  };

  const handleGoBack = useCallback(() => {
    if (goBack) {
      clHistory.back();
    } else if (deselectIdeaOnMap) {
      deselectIdeaOnMap();
    } else if (project) {
      clHistory.push(`/projects/${project.data.attributes.slug}`);
    } else {
      clHistory.push('/');
    }
  }, [goBack, deselectIdeaOnMap, project]);

  const votingConfig = getVotingMethodConfig(phase?.attributes.voting_method);
  const ideaIsInParticipationContext = phase
    ? isIdeaInParticipationContext(idea, phase)
    : false;
  const participationMethod = phase?.attributes.participation_method;

  return (
    <Container className={className || ''} data-cy="e2e-ideashowpage-topbar">
      <TopBarInner>
        <Left>
          <GoBackButtonSolid
            iconSize={isSmallerThanTablet ? '42px' : undefined}
            onClick={handleGoBack}
          />
        </Left>
        <Right>
          {participationMethod === 'ideation' &&
            showIdeationReactions(idea) && (
              <ReactionControl
                size="1"
                styleType="border"
                ideaId={ideaId}
                disabledReactionClick={onDisabledReactClick}
                variant={'icon'}
              />
            )}
          {participationMethod === 'proposals' &&
            showProposalsReactions(idea) && (
              <ReactionControl
                size="1"
                styleType="border"
                ideaId={ideaId}
                disabledReactionClick={onDisabledReactClick}
                variant={'text'}
              />
            )}
          {participationMethod === 'voting' &&
            ideaIsInParticipationContext &&
            phase && (
              <Box mr="8px">
                {votingConfig?.getIdeaPageVoteInput({
                  ideaId,
                  phase,
                  compact: true,
                })}
              </Box>
            )}
        </Right>
      </TopBarInner>
    </Container>
  );
};

export default IdeaShowPageTopBar;
