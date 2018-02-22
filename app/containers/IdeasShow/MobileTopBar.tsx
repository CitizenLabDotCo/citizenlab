import * as React from 'react';

// router
import { browserHistory } from 'react-router';

// components
import Icon from 'components/UI/Icon';
import VoteControl from 'components/VoteControl';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// style
import styled from 'styled-components';
import { media } from 'utils/styleUtils';

const TopBar: any = styled.div`
  height: 70px;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  background: #fff;
  border-bottom: solid 1px #ccc;

  ${media.biggerThanMaxTablet`
    display: none;
  `}
`;

const TopBarInner = styled.div`
  height: 100%;
  padding-left: 30px;
  padding-right: 30px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const GoBackIcon = styled(Icon)`
  height: 22px;
  fill: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: fill 100ms ease-out;
`;

const GoBackButton = styled.div`
  height: 45px;
  width: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 6px;
  margin-left: -2px;
  cursor: pointer;
  border-radius: 50%;
  border: solid 1px #e0e0e0;
  transition: all 100ms ease-out;

  &:hover {
    border-color: #000;

    ${GoBackIcon} {
      fill: #000;
    }
  }
`;

const GoBackLabel = styled.div`
  color: #666;
  font-size: 15px;
  font-weight: 400;
  transition: fill 100ms ease-out;

  ${media.smallPhone`
    display: none;
  `}
`;

const GoBackButtonWrapper = styled.div`
  height: 48px;
  align-items: center;
  display: none;

  ${media.smallerThanMaxTablet`
    display: flex;
  `}
`;

const HeaderChildWrapper = styled.div`
  display: inline-block;
`;

type Props = {
  ideaId: string;
  onGoBack: () => void;
};

type State = {};

export default class MobileTopBar extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props as any);
    this.state = {};
  }

  unauthenticatedVoteClick = () => {
    browserHistory.push('/sign-in');
  }

  render() {
    return (
      <TopBar className={this.props['className']}>
        <TopBarInner>
          <GoBackButtonWrapper>
            <GoBackButton onClick={this.props.onGoBack}>
              <GoBackIcon name="arrow-back" />
            </GoBackButton>
            <GoBackLabel>
              <FormattedMessage {...messages.goBack} />
            </GoBackLabel>
          </GoBackButtonWrapper>
          <HeaderChildWrapper>
          <VoteControl
            ideaId={this.props.ideaId}
            unauthenticatedVoteClick={this.unauthenticatedVoteClick}
            size="small"
          />
          </HeaderChildWrapper>
        </TopBarInner>
      </TopBar>
    );
  }
}
