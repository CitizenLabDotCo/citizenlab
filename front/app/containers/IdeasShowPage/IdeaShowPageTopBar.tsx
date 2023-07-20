import React, { useState, useCallback, useEffect } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// hooks
import useProjectById from 'api/projects/useProjectById';
import useAuthUser from 'api/me/useAuthUser';
import useIdeaById from 'api/ideas/useIdeaById';

// i18n
import useLocalize from 'hooks/useLocalize';

// components
import GoBackButtonSolid from 'components/UI/GoBackButton/GoBackButtonSolid';
import ReactionControl from 'components/ReactionControl';
import { Box, useBreakpoint } from '@citizenlab/cl2-component-library';

// events
import { triggerAuthenticationFlow } from 'containers/Authentication/events';

// routing
import clHistory from 'utils/cl-router/history';
import { useSearchParams } from 'react-router-dom';

// styling
import styled from 'styled-components';
import { media, colors } from 'utils/styleUtils';
import { lighten } from 'polished';

// utils
import { isFixableByAuthentication } from 'utils/actionDescriptors';
import { removeSearchParams } from 'utils/cl-router/removeSearchParams';
import { getVotingMethodConfig } from 'utils/configs/votingMethodConfig';
import { isIdeaInParticipationContext } from 'api/phases/utils';

// typings
import { IdeaReactingDisabledReason } from 'api/ideas/types';
import { IProjectData } from 'api/projects/types';
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
  participationContext?: IProjectData | IPhaseData;
}

const IdeaShowPageTopBar = ({
  ideaId,
  projectId,
  className,
  deselectIdeaOnMap,
  participationContext,
}: Props) => {
  const { data: authUser } = useAuthUser();
  const { data: project } = useProjectById(projectId);
  const { data: idea } = useIdeaById(ideaId);
  const isSmallerThanTablet = useBreakpoint('tablet');

  const [searchParams] = useSearchParams();
  const [goBack] = useState(searchParams.get('go_back'));

  const votingConfig = getVotingMethodConfig(
    participationContext?.attributes.voting_method
  );

  const ideaIsInParticipationContext =
    participationContext && idea
      ? isIdeaInParticipationContext(idea, participationContext)
      : undefined;

  useEffect(() => {
    removeSearchParams(['go_back']);
  }, []);

  const localize = useLocalize();

  const onDisabledReactClick = (
    disabled_reason: IdeaReactingDisabledReason
  ) => {
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
            action: 'reacting_idea',
            id: pcId,
            type: pcType,
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
            text={
              project ? localize(project.data.attributes.title_multiloc) : ''
            }
            iconSize={isSmallerThanTablet ? '42px' : undefined}
            onClick={handleGoBack}
          />
        </Left>
        <Right>
          {/* Only visible if not voting */}
          {participationContext?.attributes.participation_method !==
            'voting' && (
            <ReactionControl
              size="1"
              styleType="border"
              ideaId={ideaId}
              disabledReactionClick={onDisabledReactClick}
            />
          )}
          {/* Only visible if voting */}
          {ideaId && participationContext && ideaIsInParticipationContext && (
            <Box mr="8px">
              {votingConfig?.getIdeaPageVoteInput({
                ideaId,
                participationContext,
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
