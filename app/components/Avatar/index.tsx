import * as React from 'react';
import { isFunction } from 'lodash';
import * as Rx from 'rxjs/Rx';

// components
import Icon from 'components/UI/Icon';

// services
import { userByIdStream } from 'services/users';

// styles
import { darken } from 'polished';
import styled, { css } from 'styled-components';

const AvatarImageBackground: any = styled.div`
  position: absolute;
  top: -1px;
  bottom: -1px;
  left: -1px;
  right: -1px;
  z-index: 1;
  border-radius: 50%;
  background: #e4e4e4;
  transition: all 100ms ease-out;

  ${(props: any) => props.isClickable && css`
    &:hover {
      background: #ccc;
    }`
  }
`;

const AvatarImageForeground: any = styled.img`
  width: inherit;
  height: inherit;
  position: absolute;
  top: 0px;
  left: 0px;
  border-radius: 50%;
  /* background-image: url(${(props: any) => props.src});
  background-repeat: no-repeat;
  background-size: cover; */
  overflow: hidden;
  z-index: 2;
`;

const AvatarIcon: any = styled(Icon)`
  height: 100%;
  fill: ${(props) => props.theme.colors.label};
  transition: all 100ms ease-out;

  ${(props: any) => props.isClickable && css`
    &:hover {
      fill: ${(props) => darken(0.2, props.theme.colors.label)};
    }`
  }
`;

const Container: any = styled.div`
  width: inherit;
  height: inherit;
  position: relative;
  cursor: ${(props: any) => props.isClickable ? 'pointer' : 'auto'};
  border: solid 1px red;
`;

type Props = {
  userId: string | null;
  size: 'small' | 'medium' | 'large';
  onClick?: () => void;
};

type State = {
  avatarSrc: string | null;
  loaded: boolean;
};

export default class Avatar extends React.PureComponent<Props, State> {
  subscriptions: Rx.Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      avatarSrc: null,
      loaded: false
    };
    this.subscriptions = [];
  }

  componentDidMount() {
    if (this.props.userId && this.props.userId.length > 0) {
      const user$ = userByIdStream(this.props.userId).observable;

      this.subscriptions = [
        user$.subscribe((user) => {
          const avatarSrc = (user ? user.data.attributes.avatar[this.props.size] : null);
          this.setState({ avatarSrc, loaded: true });
        })
      ];
    } else {
      this.setState({ loaded: true });
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
    const { avatarSrc, loaded } = this.state;
    const isClickable = isFunction(this.props.onClick);

    return (
      <Container className={className} onClick={this.handleOnClick}>
        {(loaded && avatarSrc) && (
          <React.Fragment>
            <AvatarImageBackground isClickable={isClickable} />
            <AvatarImageForeground src={avatarSrc} />
          </React.Fragment>
        )}

        {(loaded && !avatarSrc) && (
          <AvatarIcon name="user" isClickable={isClickable} />
        )}
      </Container>
    );
  }
}
