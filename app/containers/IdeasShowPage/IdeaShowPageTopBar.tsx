import React, { memo, useCallback, MouseEvent } from 'react';
import clHistory from 'utils/cl-router/history';
import { adopt } from 'react-adopt';
import { get } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';

// resources
import GetWindowSize, {
  GetWindowSizeChildProps,
} from 'resources/GetWindowSize';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetIdea, { GetIdeaChildProps } from 'resources/GetIdea';
import GetProject, { GetProjectChildProps } from 'resources/GetProject';

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

interface InputProps {
  ideaId: string;
  insideModal?: boolean;
  className?: string;
}

interface DataProps {
  windowSize: GetWindowSizeChildProps;
  authUser: GetAuthUserChildProps;
  idea: GetIdeaChildProps;
  project: GetProjectChildProps;
}

interface Props extends InputProps, DataProps {}

const IdeaShowPageTopBar = memo<Props>(
  ({ ideaId, insideModal, className, project, windowSize, authUser }) => {
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
      ? windowSize <= viewportWidths.largeTablet
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
  }
);

const Data = adopt<DataProps, InputProps>({
  windowSize: <GetWindowSize />,
  authUser: <GetAuthUser />,
  idea: ({ ideaId, render }) => <GetIdea ideaId={ideaId}>{render}</GetIdea>,
  project: ({ idea, render }) => (
    <GetProject projectId={get(idea, 'relationships.project.data.id')}>
      {render}
    </GetProject>
  ),
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <IdeaShowPageTopBar {...inputProps} {...dataProps} />}
  </Data>
);
