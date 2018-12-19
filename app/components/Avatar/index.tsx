import React, { PureComponent, FormEvent } from 'react';
import { isFunction } from 'lodash-es';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// components
import Icon from 'components/UI/Icon';

// services
import { getUserName } from 'services/users';

// resources
import GetUser, { GetUserChildProps } from 'resources/GetUser';

// i18n
import injectIntl from 'utils/cl-intl/injectIntl';
import FormattedMessage from 'utils/cl-intl/FormattedMessage';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

// styles
import { darken, lighten } from 'polished';
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

 export const AvatarContainer: any = styled.div`
  flex: 0 0 ${(props: any) => props.pxSize};
  width: ${(props: any) => props.pxSize};
  height: ${(props: any) => props.pxSize};
  cursor: inherit;
  color: #000;
  display: flex;
  align-items: center;
  justify-content: center;

  &.clickable {
    cursor: pointer;
  }
`;

export const AvatarImage: any = styled.img`
  width: ${(props: any) => props.pxSize};
  height: ${(props: any) => props.pxSize};
  border-radius: 50%;
  border: 2px solid #fff;
  transition: all 100ms ease-out;

  &.clickable:hover {
    border-color: #000;
  }
`;

const AvatarIcon: any = styled(Icon)`
  flex: 0 0 ${(props: any) => props.pxSize};
  width: ${(props: any) => props.pxSize};
  height: ${(props: any) => props.pxSize};
  fill: ${lighten(0.2, colors.label)};
  transition: all 100ms ease-out;

  &.clickable:hover {
    fill: ${darken(0.2, colors.label)};
  }
`;

interface InputProps {
  userId: string | null;
  size: string;
  onClick?: (event: FormEvent) => void;
  hideIfNoAvatar?: boolean | undefined;
  className?: string;
}

interface DataProps {
  user: GetUserChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {}

class Avatar extends PureComponent<Props & InjectedIntlProps, State> {
  handleOnClick = (event: FormEvent) => {
    if (this.props.onClick) {
      this.props.onClick(event);
    }
  }

  render() {
    const { hideIfNoAvatar, user, size, onClick, className } = this.props;

    if (!isNilOrError(user) && hideIfNoAvatar !== true) {
      const isClickable = (onClick && isFunction(onClick));
      const imageSize = (parseInt(size, 10) > 160 ? 'large' : 'medium');
      const avatarSrc = user.attributes.avatar[imageSize];
      const userName = getUserName(user);

      return (
        <AvatarContainer
          className={`${className} ${isClickable ? 'clickable' : ''}`}
          onClick={this.handleOnClick}
          pxSize={size}
        >
          {avatarSrc ? (
            <AvatarImage
              className={`${isClickable ? 'clickable' : ''}`}
              src={avatarSrc}
              alt={this.props.intl.formatMessage(messages.avatarAltText, { userName })}
              pxSize={size}
            />
          ) : (
            <AvatarIcon
              className={`${isClickable ? 'clickable' : ''}`}
              name="user"
              title={<FormattedMessage {...messages.noAvatarAltText} />}
              pxSize={size}
            />
          )}
        </AvatarContainer>
      );
    }

    return null;
  }
}

const Data = adopt<DataProps, InputProps>({
  user: ({ userId, render }) => <GetUser id={userId}>{render}</GetUser>
});

const AvatarWithHoc = injectIntl<Props>(Avatar);

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <AvatarWithHoc {...inputProps} {...dataProps} />}
  </Data>
);
