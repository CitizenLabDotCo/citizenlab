import React, { PureComponent } from 'react';
import { isFunction } from 'lodash-es';
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
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

const Container: any = styled.div`
  flex: 0 0 ${(props: any) => props.pxSize}px;
  width: ${(props: any) => props.pxSize}px;
  height: ${(props: any) => props.pxSize}px;
  cursor: inherit;
  color: #000;
  display: flex;
  align-items: center;
  justify-content: center;

  &.clickable {
    cursor: pointer;
  }
`;

const AvatarImage: any = styled.img`
  flex: 0 0 ${(props: any) => props.pxSize}px;
  width: ${(props: any) => props.pxSize}px;
  height: ${(props: any) => props.pxSize}px;
  border-radius: 50%;
  border: 1px solid #ccc;
  transition: all 100ms ease-out;

  &.clickable:hover {
    border-color: #000;
  }
`;

const AvatarIcon: any = styled(Icon)`
  flex: 0 0 ${(props: any) => props.pxSize}px;
  width: ${(props: any) => props.pxSize}px;
  height: ${(props: any) => props.pxSize}px;
  fill: ${lighten(0.2, colors.label)};
  transition: all 100ms ease-out;

  &.clickable:hover {
    fill: ${darken(0.2, colors.label)};
  }
`;

type Props = {
  userId: string | null;
  size: 'small' | 'medium' | 'large';
  onClick?: (event: React.FormEvent) => void;
  hideIfNoAvatar?: boolean | undefined;
};

type State = {
  avatarSrc: string | null;
  userName: string | null;
};

export class Avatar extends PureComponent<Props & InjectedIntlProps, State> {
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

  handleOnClick = (event: React.FormEvent) => {
    if (this.props.onClick) {
      this.props.onClick(event);
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
      pxSize = 30;
    } else if (size === 'medium') {
      pxSize = 36;
    } else {
      pxSize = 180;
    }

    return (
      <Container
        className={`${className} ${isClickable ? 'clickable' : ''}`}
        onClick={this.handleOnClick}
        pxSize={pxSize}
      >
        {avatarSrc ? (
          <AvatarImage
            className={`${isClickable ? 'clickable' : ''}`}
            src={avatarSrc}
            alt={this.props.intl.formatMessage(messages.avatarAltText, { userName })}
            pxSize={pxSize}
          />
        ) : (
          <AvatarIcon
            className={`${isClickable ? 'clickable' : ''}`}
            name="user"
            title={<FormattedMessage {...messages.noAvatarAltText} />}
            pxSize={pxSize}
          />
        )}
      </Container>
    );
  }
}

export default injectIntl<Props>(Avatar);
