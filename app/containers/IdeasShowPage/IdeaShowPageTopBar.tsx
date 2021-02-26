import React, { memo, useCallback, MouseEvent } from 'react';
import clHistory from 'utils/cl-router/history';
import { get } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';

// hooks
import useIdea from 'hooks/useIdea';
import useProject from 'hooks/useProject';
import useAuthUser from 'hooks/useAuthUser';
import useWindowSize from 'hooks/useWindowSize';

// components
import VoteControl from 'components/VoteControl';
import { Icon } from 'cl2-component-library';

// utils
import eventEmitter from 'utils/eventEmitter';
import { openVerificationModal } from 'components/Verification/verificationModalEvents';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// styling
import styled from 'styled-components';
import { media, colors, fontSizes, viewportWidths } from 'utils/styleUtils';
import { lighten } from 'polished';

// typings
import { IdeaVotingDisabledReason } from 'services/ideas';

const Container = styled.div`
  height: ${(props) => props.theme.mobileTopBarHeight}px;
  background-color: ${colors.background};
  border-bottom: solid 1px ${lighten(0.4, colors.label)};
`;

const TopBarInner = styled.div`
  height: 100%;
  padding-left: 15px;
  padding-right: 15px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;

  ${media.biggerThanMinTablet`
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

const GoBackIcon = styled(Icon)`
  height: 22px;
  fill: ${colors.label};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: fill 100ms ease-out;
`;

const GoBackButton = styled.button`
  width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin: 0;
  margin-right: 6px;
  margin-left: -2px;
  cursor: pointer;
  background: #fff;
  border-radius: 50%;
  transition: all 100ms ease-out;
  box-shadow: 0px 4px 3px rgba(0, 0, 0, 0.05);

  &:hover {
    border-color: #000;

    ${GoBackIcon} {
      fill: #000;
    }
  }
`;

const GoBackLabel = styled.div`
  color: ${colors.label};
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  transition: fill 100ms ease-out;

  ${media.phone`
    display: none;
  `}
`;

interface Props {
  ideaId: string;
  insideModal?: boolean;
  className?: string;
}

const IdeaShowPageTopBar = memo<Props>(({ ideaId, insideModal, className }) => {
  const windowSize = useWindowSize();
  const authUser = useAuthUser();
  const idea = useIdea({ ideaId });
  const project = useProject({
    projectId: get(idea, 'relationships.project.data.id'),
  });
  const onGoBack = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      event.preventDefault();

      if (insideModal) {
        eventEmitter.emit('closeIdeaModal');
      } else if (!isNilOrError(project)) {
        clHistory.push(`/projects/${project.attributes.slug}`);
      } else {
        clHistory.push('/');
      }
    },
    [insideModal]
  );

  const onDisabledVoteClick = useCallback(
    (disabled_reason: IdeaVotingDisabledReason) => {
      if (
        !isNilOrError(authUser) &&
        !isNilOrError(project) &&
        disabled_reason === 'not_verified'
      ) {
        const pcType =
          project.attributes.process_type === 'continuous'
            ? 'project'
            : 'phase';
        const pcId =
          project.relationships?.current_phase?.data?.id || project.id;

        if (pcId && pcType) {
          openVerificationModal({
            context: {
              action: 'voting_idea',
              id: pcId,
              type: pcType,
            },
          });
        }
      }
    },
    [authUser, project]
  );

  const smallerThanLargeTablet = windowSize
    ? windowSize.windowWidth <= viewportWidths.largeTablet
    : false;

  if (smallerThanLargeTablet) {
    return (
      <Container className={className}>
        <TopBarInner>
          <Left>
            <GoBackButton onClick={onGoBack}>
              <GoBackIcon ariaHidden name="arrow-back" />
            </GoBackButton>
            <GoBackLabel>
              <FormattedMessage {...messages.goBack} />
            </GoBackLabel>
          </Left>
          <Right>
            <VoteControl
              style="shadow"
              size="1"
              ideaId={ideaId}
              disabledVoteClick={onDisabledVoteClick}
            />
          </Right>
        </TopBarInner>
      </Container>
    );
  }

  return null;
});

export default IdeaShowPageTopBar;
