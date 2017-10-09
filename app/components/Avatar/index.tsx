import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';

// components
import Icon from 'components/UI/Icon';

// services
import { userByIdStream } from 'services/users';

// styles
import { darken } from 'polished';
import styled, { css } from 'styled-components';

const AvatarImage = styled.img`
  height: 100%;
  border-radius: 50%;
`;

const AvatarIcon = styled(Icon)`
  height: 100%;
  fill: #999;
  transition: all 100ms ease-out;

  ${(props: any) => props.isClickable && css`
    &:hover {
      fill: ${(props) => darken(0.15, '#84939E')};
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
      fill: ${(props) => darken(0.15, '#999')};
    }`
  }
`;

type Props = {
  userId: string;
  size: 'small' | 'medium' | 'large';
  onClick?: () => void;
};

type State = {
  avatarSrc: string | null;
};

export default class Avatar extends React.PureComponent<Props, State> {
  state: State;
  subscriptions: Rx.Subscription[];

  constructor() {
    super();
    this.state = {
      avatarSrc: null
    };
    this.subscriptions = [];
  }

  componentWillMount() {
    const user$ = userByIdStream(this.props.userId).observable;

    this.subscriptions = [
      user$.subscribe((user) => {
        const avatarSrc = (user ? user.data.attributes.avatar[this.props.size] : null);
        this.setState({ avatarSrc });
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  handleOnClick = (event) => {
    if (this.props.onClick && _.isFunction(this.props.onClick)) {
      this.props.onClick();
    }
  }

  render() {
    const className = this.props['className'];
    const { avatarSrc } = this.state;
    const isClickable = (this.props.onClick && _.isFunction(this.props.onClick));

    return (
      <Container className={className} isClickable={isClickable} onClick={this.handleOnClick}>
        {avatarSrc ? <AvatarImage src={avatarSrc} /> : <AvatarIcon name="user" />}
      </Container>
    );
  }
}
