import React from 'react';
import { isFunction } from 'lodash';
import { Subscription } from 'rxjs';
import { isNilOrError } from 'utils/helperUtils';

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
      fill: ${(props: any) => darken(0.2, props.theme.colors.label)};
    }`
  }
`;

const Container: any = styled.div`
  width: ${props => props.pxSize}px;
  height: ${props => props.pxSize}px;
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
  subscriptions: Subscription[];

  constructor(props) {
    super(props);
    this.state = {
      avatarSrc: null,
      userName: null,
    };
    this.subscriptions = [];
  }

  componentDidMount() {
    const { userId, size } = this.props;

    if (userId) {
      const user$ = userByIdStream(userId).observable;

      this.subscriptions = [
        user$.subscribe((user) => {
          const avatarSrc = (!isNilOrError(user) ? user.data.attributes.avatar[size] : null);
          const userName = (!isNilOrError(user) ? getUserName(user.data) : null);

          this.setState({
            avatarSrc,
            userName
          });
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

    const { hideIfNoAvatar, size } = this.props;

    if (hideIfNoAvatar && !avatarSrc) {
      return null;
    }

    let pxSize = 0;
    if (size === 'small') {
      pxSize = 28;
    } else if (size === 'medium') {
      pxSize = 35;
    } else {
      pxSize = 160;
    }

    return (
      <Container className={className} isClickable={isClickable} onClick={this.handleOnClick} pxSize={pxSize}>
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
