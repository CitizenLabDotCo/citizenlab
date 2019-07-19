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
import { lighten } from 'polished';
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

export const AvatarImage: any = styled.img`
  width: ${(props: any) => props.size};
  height: ${(props: any) => props.size};
  border-radius: 50%;
  background: #fff;
  transition: all 100ms ease-out;
`;

const AvatarIcon: any = styled(Icon)`
  flex: 0 0 ${(props: any) => props.size};
  width: ${(props: any) => props.size};
  height: ${(props: any) => props.size};
  fill: ${(props: any) => props.fillColor};
  transition: all 100ms ease-out;
`;

 export const Container: any = styled.div`
  flex: 0 0 ${(props: any) => props.size};
  width: ${(props: any) => props.size};
  height: ${(props: any) => props.size};
  cursor: inherit;
  color: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 100ms ease-out;
  background: transparent;
  position: relative;

  &.hasHoverEffect {
    cursor: pointer;
    border: solid ${(props: any) => props.borderThickness} ${(props: any) => props.borderColor};

    &:hover {
      border-color: ${(props: any) => props.borderHoverColor};

      ${AvatarIcon} {
        fill: ${(props: any) => props.fillHoverColor};
      }
    }
  }
`;

const BadgeContainer: any = styled.div`
  flex: 0 0 ${(props: any) => props.size / 2 + 5}px;
  width: ${(props: any) => props.size / 2 + 5}px;
  height: ${(props: any) => props.size / 2 + 5}px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  right: -${(props: any) => props.size / 19}px;
  bottom: -${(props: any) => props.size / 19}px;
  border-radius: 50%;
  padding-top: 1px;
  padding-left: 1px;
  background: ${(props: any) => props.badgeBgColor};
`;

const BadgeIcon: any = styled(Icon)`
  color: ${colors.clRedError};
  fill: ${colors.clRedError};
  height: ${(props: any) => (props.size / 2) - 5}px;
`;

interface InputProps {
  userId: string | null;
  size: string;
  onClick?: (event: FormEvent) => void;
  hasHoverEffect?: boolean;
  hideIfNoAvatar?: boolean | undefined;
  padding?: string;
  fillColor?: string;
  fillHoverColor?: string;
  borderThickness?: string;
  borderColor?: string;
  borderHoverColor?: string;
  badgeBgColor?: string;
  className?: string;
  moderator?: boolean | null;
}

interface DataProps {
  user: GetUserChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {}

class Avatar extends PureComponent<Props & InjectedIntlProps, State> {
  static defaultProps = {
    hasHoverEffect: false,
    padding: '3px',
    fillColor: lighten(0.2, colors.label),
    fillHoverColor: colors.label,
    borderThickness: '1px',
    borderColor: 'transparent',
    borderHoverColor: colors.label,
    badgeBgColor: '#fff'
  };

  handleOnClick = (event: FormEvent) => {
    if (this.props.onClick) {
      this.props.onClick(event);
    }
  }

  render() {
    let { hasHoverEffect } = this.props;
    const { hideIfNoAvatar, user, size, onClick, padding, fillColor, fillHoverColor, borderThickness, borderColor, borderHoverColor, badgeBgColor, moderator, className } = this.props;

    if (!isNilOrError(user) && hideIfNoAvatar !== true) {
      hasHoverEffect = (isFunction(onClick) || hasHoverEffect);
      const imageSize = (parseInt(size, 10) > 160 ? 'large' : 'medium');
      const avatarSrc = user.attributes.avatar && user.attributes.avatar[imageSize];
      const userName = getUserName(user);
      const containerSize =  `${parseInt(size, 10) + (parseInt(padding as string, 10) * 2) + (parseInt(borderThickness as string, 10) * 2)}px`;
      const numberSize = parseInt(size, 10);

      return (
        <Container
          className={`${className} ${hasHoverEffect ? 'hasHoverEffect' : ''}`}
          onClick={this.handleOnClick}
          size={containerSize}
          borderThickness={borderThickness}
          borderColor={borderColor}
          borderHoverColor={moderator ? colors.clRedError : borderHoverColor}
          fillHoverColor={fillHoverColor}
        >
          {avatarSrc ? (
            <AvatarImage
              className={`avatarImage ${hasHoverEffect ? 'hasHoverEffect' : ''}`}
              src={avatarSrc}
              alt={this.props.intl.formatMessage(messages.avatarAltText, { userName })}
              size={size}
            />
          ) : (
            <AvatarIcon
              className={`avatarIcon ${hasHoverEffect ? 'hasHoverEffect' : ''}`}
              name="user"
              title={<FormattedMessage {...messages.noAvatarAltText} />}
              size={size}
              fillColor={fillColor}
              fillHoverColor={fillHoverColor}
            />
          )}
          {moderator && (
            <BadgeContainer size={numberSize} badgeBgColor={badgeBgColor}>
              <BadgeIcon name="clLogo" size={numberSize} />
            </BadgeContainer>
          )}
        </Container>
      );
    }

    return null;
  }
}

const Data = adopt<DataProps, InputProps>({
  user: ({ userId, render }) => <GetUser id={userId}>{render}</GetUser>
});

const AvatarWithHoc = injectIntl<Props>(Avatar);

const WrappedAvatar = (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <AvatarWithHoc {...inputProps} {...dataProps} />}
  </Data>
);

export default WrappedAvatar;
