import React, { useState, useCallback, useEffect } from 'react';
import { isNilOrError } from 'utils/helperUtils';

import useProjectById from 'api/projects/useProjectById';
import useAuthUser from 'api/me/useAuthUser';
import useIdeaById from 'api/ideas/useIdeaById';

import GoBackButtonSolid from 'components/UI/GoBackButton/GoBackButtonSolid';
import ReactionControl from 'components/ReactionControl';
import {
  Box,
  useBreakpoint,
  media,
  colors,
} from '@citizenlab/cl2-component-library';

import { triggerAuthenticationFlow } from 'containers/Authentication/events';

// routing
import clHistory from 'utils/cl-router/history';
import { useSearchParams } from 'react-router-dom';

import styled from 'styled-components';
import { lighten } from 'polished';

import { isFixableByAuthentication } from 'utils/actionDescriptors';
import { removeSearchParams } from 'utils/cl-router/removeSearchParams';
import { getVotingMethodConfig } from 'utils/configs/votingMethodConfig';
import { isIdeaInParticipationContext } from 'api/phases/utils';

import { IdeaReactingDisabledReason } from 'api/ideas/types';
import { IPhaseData } from 'api/phases/types';

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
  ideaId?: string;
  projectId: string;
  deselectIdeaOnMap?: () => void;
  className?: string;
  phase?: IPhaseData;
}

const IdeaShowPageTopBar = ({
  ideaId,
  projectId,
  className,
  deselectIdeaOnMap,
  phase,
}: Props) => {
  const { data: authUser } = useAuthUser();
  const { data: project } = useProjectById(projectId);
  const { data: idea } = useIdeaById(ideaId);
  const isSmallerThanTablet = useBreakpoint('tablet');

  const [searchParams] = useSearchParams();
  const [goBack] = useState(searchParams.get('go_back'));

  const votingConfig = getVotingMethodConfig(phase?.attributes.voting_method);

  const ideaIsInParticipationContext =
    phase && idea ? isIdeaInParticipationContext(idea, phase) : undefined;

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

  return (
    <Container className={className || ''}>
      <TopBarInner>
        <Left>
          <GoBackButtonSolid
            iconSize={isSmallerThanTablet ? '42px' : undefined}
            onClick={handleGoBack}
          />
        </Left>
        <Right>
          {/* Only visible if not voting */}
          {phase?.attributes.participation_method !== 'voting' && ( // To reduce bias we want to hide the reactions during voting methods
            <ReactionControl
              size="1"
              styleType="border"
              ideaId={ideaId}
              disabledReactionClick={onDisabledReactClick}
            />
          )}
          {/* Only visible if voting */}
          {ideaId && phase && ideaIsInParticipationContext && (
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
