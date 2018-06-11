import * as React from 'react';
import { isFunction } from 'lodash';
import * as Rx from 'rxjs/Rx';

// components
import Icon from 'components/UI/Icon';

// services
import { userByIdStream, getUserName } from 'services/users';

// i18n
import injectIntl from 'utils/cl-intl/injectIntl';
import FormattedMessage from 'utils/cl-intl/FormattedMessage';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

// styles
import { darken, lighten } from 'polished';
import styled, { css } from 'styled-components';

const AvatarImage = styled.img`
  height: 100%;
  width: 100%;
  border-radius: 50%;
  border: 1px solid #eaeaea;
  background: #eaeaea;
`;

const AvatarIcon = styled(Icon)`
  height: 100%;
  fill: ${(props) => props.theme.colors.label};
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
  cursor: ${(props: any) => props.isClickable ? 'pointer' : 'inherit'};

  ${(props: any) => props.isClickable && css`
    &:hover ${AvatarIcon} {
      fill: ${(props) => darken(0.2, props.theme.colors.label)};
    }

    &:hover ${AvatarImage} {
      background: #ccc;
      border-color: #ccc;
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
  userName: string | null;
};

export class Avatar extends React.PureComponent<Props & InjectedIntlProps, State> {
  subscriptions: Rx.Subscription[];

  constructor(props: Props) {
    super(props as any);
    this.state = {
      avatarSrc: null,
      userName: null,
    };
    this.subscriptions = [];
  }

  componentDidMount() {
    if (this.props.userId) {
      const user$ = userByIdStream(this.props.userId).observable;

      this.subscriptions = [
        user$.subscribe((user) => {
          const avatarSrc = (user ? user.data.attributes.avatar[this.props.size] : null);
          this.setState({ avatarSrc, userName: getUserName(user.data) });
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
    const { avatarSrc, userName } = this.state;
    const isClickable = (this.props.onClick && isFunction(this.props.onClick));

    if (this.props.hideIfNoAvatar && !avatarSrc) {
      return null;
    }

    return (
      <Container className={className} isClickable={isClickable} onClick={this.handleOnClick}>
        {avatarSrc ? (
          <AvatarImage src={avatarSrc} alt={this.props.intl.formatMessage(messages.avatarAltText, { userName })} />
        ) : (
          <AvatarIcon name="user" title={<FormattedMessage {...messages.noAvatarAltText} />} />
        )}
      </Container>
    );
  }
}

export default injectIntl<Props>(Avatar);
