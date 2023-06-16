import React, { useState, useCallback, useEffect } from 'react';
import { isString } from 'lodash-es';
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

// routing
import clHistory from 'utils/cl-router/history';
import { useSearchParams } from 'react-router-dom';

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
  deselectIdeaOnMap?: () => void;
  className?: string;
}

const IdeaShowPageTopBar = ({
  ideaId,
  projectId,
  className,
  deselectIdeaOnMap,
}: Props) => {
  const { data: authUser } = useAuthUser();
  const { data: project } = useProjectById(projectId);

  const [goBack, setGoBack] = useState(false);
  const [queryParams] = useSearchParams();
  const goBackParameter = queryParams.get('go_back');

  useEffect(() => {
    if (isString(goBackParameter)) {
      setGoBack(true);
      clHistory.replace(window.location.pathname);
    }
  }, [goBackParameter]);

  const localize = useLocalize();

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
