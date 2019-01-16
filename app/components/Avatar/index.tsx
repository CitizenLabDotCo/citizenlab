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
  border: ${(props: any) => props.borderThickness} solid ${(props: any) => props.borderColor};
  background: #fff;
  transition: all 100ms ease-out;

  &.clickable:hover {
    border-color: ${(props: any) => props.borderHoverColor};
  }
`;

const AvatarIcon: any = styled(Icon)`
  flex: 0 0 ${(props: any) => props.pxSize};
  width: ${(props: any) => props.pxSize};
  height: ${(props: any) => props.pxSize};
  fill: ${(props: any) => props.fillColor};
  transition: all 100ms ease-out;

  &.clickable:hover {
    fill: ${(props: any) => props.fillHoverColor}
  }
`;

interface InputProps {
  userId: string | null;
  size: string;
  onClick?: (event: FormEvent) => void;
  hideIfNoAvatar?: boolean | undefined;
  fillColor?: string;
  fillHoverColor?: string;
  borderThickness?: string;
  borderColor?: string;
  borderHoverColor?: string;
  className?: string;
}

interface DataProps {
  user: GetUserChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {}

class Avatar extends PureComponent<Props & InjectedIntlProps, State> {
  static defaultProps = {
    fillColor: lighten(0.2, colors.label),
    fillHoverColor: darken(0.1, colors.label),
    borderThickness: '1px',
    borderColor: colors.separation,
    borderHoverColor: '#000'
  };

  handleOnClick = (event: FormEvent) => {
    if (this.props.onClick) {
      this.props.onClick(event);
    }
  }

  render() {
    const { hideIfNoAvatar, user, size, onClick, fillColor, fillHoverColor, borderThickness, borderColor, borderHoverColor, className } = this.props;

    if (!isNilOrError(user) && hideIfNoAvatar !== true) {
      const hasHoverEffect = (isFunction(onClick));
      const imageSize = (parseInt(size, 10) > 160 ? 'large' : 'medium');
      const avatarSrc = user.attributes.avatar[imageSize];
      const userName = getUserName(user);

      return (
        <AvatarContainer
          className={`${className} ${hasHoverEffect ? 'clickable' : ''}`}
          onClick={this.handleOnClick}
          pxSize={size}
        >
          {avatarSrc ? (
            <AvatarImage
              className={`avatarImage ${hasHoverEffect ? 'clickable' : ''}`}
              src={avatarSrc}
              alt={this.props.intl.formatMessage(messages.avatarAltText, { userName })}
              pxSize={size}
              borderThickness={borderThickness}
              borderColor={borderColor}
              borderHoverColor={borderHoverColor}
            />
          ) : (
            <AvatarIcon
              className={`avatarIcon ${hasHoverEffect ? 'clickable' : ''}`}
              name="user"
              title={<FormattedMessage {...messages.noAvatarAltText} />}
              pxSize={size}
              fillColor={fillColor}
              fillHoverColor={fillHoverColor}
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
