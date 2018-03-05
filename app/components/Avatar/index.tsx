import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';

// components
import Icon from 'components/UI/Icon';

// services
import { userByIdStream } from 'services/users';

// styles
import { darken, lighten } from 'polished';
import styled, { css } from 'styled-components';
// import { color } from 'utils/styleUtils';

const AvatarImageContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const AvatarImage = styled.img`
  height: 100%;
  border-radius: 50%;
  z-index: 2;
`;

const AvatarImageBackground = styled.div`
  position: absolute;
  top: -1px;
  bottom: -1px;
  left: -1px;
  right: -1px;
  z-index: 1;
  border-radius: 50%;
  background: #e4e4e4;
  transition: all 100ms ease-out;
`;

const AvatarIcon = styled(Icon)`
  height: 100%;
  fill: ${(props) => lighten(0.2, props.theme.colors.label)};
  transition: all 100ms ease-out;

  ${(props: any) => props.isClickable && css`
    &:hover {
      fill: ${(props) => darken(0.2, props.theme.colors.label)};
    }`
  }
`;

const Container: any = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: Center;
  cursor: ${(props: any) => props.isClickable ? 'pointer' : 'auto'};

  ${(props: any) => props.isClickable && css`
    &:hover ${AvatarIcon} {
      fill: ${(props) => darken(0.2, props.theme.colors.label)};
    }

    &:hover ${AvatarImageBackground} {
      background: #ccc;
    }`
  }
`;

type Props = {
  userId: string | null;
  size: 'small' | 'medium' | 'large';
  onClick?: () => void;
  hideIfNoAvatar?: boolean | undefined;
};

type State = {
  avatarSrc: string | null;
};

export default class Avatar extends React.PureComponent<Props, State> {
  subscriptions: Rx.Subscription[];

  constructor(props: Props) {
    super(props as any);
    this.state = {
      avatarSrc: null
    };
    this.subscriptions = [];
  }

  componentDidMount() {
    if (this.props.userId) {
      const user$ = userByIdStream(this.props.userId).observable;

      this.subscriptions = [
        user$.subscribe((user) => {
          const avatarSrc = (user ? user.data.attributes.avatar[this.props.size] : null);
          this.setState({ avatarSrc });
        })
      ];
    }
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  handleOnClick = () => {
    if (this.props.onClick) {
      this.props.onClick();
    }
  }

  render() {
    const className = this.props['className'];
    const { avatarSrc } = this.state;
    const isClickable = (this.props.onClick && _.isFunction(this.props.onClick));

    if (this.props.hideIfNoAvatar && !avatarSrc) {
      return null;
    }

    return (
      <Container className={className} isClickable={isClickable} onClick={this.handleOnClick}>
        {avatarSrc ? (
          <AvatarImageContainer>
            <AvatarImageBackground />
            <AvatarImage src={avatarSrc} />
          </AvatarImageContainer>
        ) : (
          <AvatarIcon name="user" />
        )}
      </Container>
    );
  }
}
