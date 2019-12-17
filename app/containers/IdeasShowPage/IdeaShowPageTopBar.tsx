import React, { memo, useCallback, MouseEvent } from 'react';
import clHistory from 'utils/cl-router/history';
import { adopt } from 'react-adopt';
import { get } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';

// resources
import GetIdea, { GetIdeaChildProps } from 'resources/GetIdea';
import GetProject, { GetProjectChildProps } from 'resources/GetProject';

// components
import VoteControl from 'components/VoteControl';
import Icon from 'components/UI/Icon';

// utils
import eventEmitter from 'utils/eventEmitter';
import { openVerificationModalWithContext } from 'containers/App/events';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// styling
import styled from 'styled-components';
import { media, colors, fontSizes } from 'utils/styleUtils';
import { lighten } from 'polished';

const Container = styled.div`
  height: ${props => props.theme.mobileTopBarHeight}px;
  background: #fff;
  border-bottom: solid 1px ${colors.separation};

  ${media.biggerThanMaxTablet`
    display: none;
  `}
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
  display: none;

  ${media.smallerThanMaxTablet`
    display: flex;
  `}
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
  border: solid 1px ${lighten(0.4, colors.label)};
  transition: all 100ms ease-out;

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

interface InputProps {
  ideaId: string;
  insideModal?: boolean;
  className?: string;
}

interface DataProps {
  idea: GetIdeaChildProps;
  project: GetProjectChildProps;
}

interface Props extends InputProps, DataProps {}

const IdeaShowPageTopBar = memo<Props>(({ ideaId, insideModal, className, project }) => {

  const onGoBack = useCallback((event: MouseEvent<HTMLElement>) => {
    event.preventDefault();

    if (insideModal) {
      eventEmitter.emit('IdeaShowPageTopBar', 'closeIdeaModal', null);
    } else {
      clHistory.push('/');
    }
  }, []);

  const onUnauthenticatedVoteClick = useCallback(() => {
    clHistory.push('/sign-in');
  }, []);

  const onDisabledVoteClick = useCallback((disabled_reason: string) => {
    if (disabled_reason === 'not_verified') {
      if (!isNilOrError(project)) {
        const pcType = project.attributes.process_type === 'continuous' ? 'project' : 'phase';
        const pcId = project.relationships?.current_phase?.data?.id || project.id;
        pcId && openVerificationModalWithContext('ActionVote', pcId, pcType, 'voting');
      }
    }
  }, []);

  return (
    <Container className={className}>
      <TopBarInner>
        <Left>
          <GoBackButton onClick={onGoBack}>
            <GoBackIcon name="arrow-back" />
          </GoBackButton>
          <GoBackLabel>
            <FormattedMessage {...messages.goBack} />
          </GoBackLabel>
        </Left>
        <Right>
          <VoteControl
            ideaId={ideaId}
            unauthenticatedVoteClick={onUnauthenticatedVoteClick}
            disabledVoteClick={onDisabledVoteClick}
            size="1"
          />
        </Right>
      </TopBarInner>
    </Container>
  );
});

const Data = adopt<DataProps, InputProps>({
  idea: ({ ideaId, render }) => <GetIdea id={ideaId}>{render}</GetIdea>,
  project: ({ idea, render }) => <GetProject projectId={get(idea, 'relationships.project.data.id')}>{render}</GetProject>,
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <IdeaShowPageTopBar {...inputProps} {...dataProps} />}
  </Data>
);
