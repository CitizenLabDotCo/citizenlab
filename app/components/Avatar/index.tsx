import React, { PureComponent, FormEvent } from 'react';
import { isFunction } from 'lodash-es';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// components
import Icon from 'components/UI/Icon';
import FeatureFlag from 'components/FeatureFlag';

// services
import { getUserName } from 'services/users';

// resources
import GetUser, { GetUserChildProps } from 'resources/GetUser';

// i18n
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

// styles
import { lighten } from 'polished';
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

export const AvatarImage = styled.img<{ size: string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  border-radius: 50%;
  background: #fff;
  transition: all 100ms ease-out;
`;

const AvatarIcon = styled(Icon)<{ size: string, fillColor: string | undefined }>`
  flex: 0 0 ${({ size }) => size};
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  ${({ fillColor }) => fillColor ? `fill: ${fillColor};` : ''};
  transition: all 100ms ease-out;
`;

 export const Container = styled.div<{
   size: string,
   bgColor: string | undefined,
   borderColor: string | undefined,
   borderThickness: string | undefined,
   borderHoverColor: string | undefined,
   fillHoverColor: string | undefined
  }>`
  flex: 0 0 ${({ size }) => size};
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  cursor: inherit;
  color: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 100ms ease-out;
  background: transparent;
  position: relative;
  ${({ bgColor }) => bgColor ? `background: ${bgColor};` : ''}
  ${({ borderThickness, borderColor }) => borderColor ? `border: solid ${borderThickness || '1px'} borderColor;` : ''}

  &.hasHoverEffect {
    cursor: pointer;

    &:hover {
      ${({ borderHoverColor }) => borderHoverColor ? `border-color: ${borderHoverColor};` : ''};

      ${AvatarIcon} {
        ${({ fillHoverColor }) => fillHoverColor ? `fill: ${fillHoverColor};` : ''};
      }
    }
  }
`;

const ModeratorBadgeContainer = styled.div<{ size: number, bgColor: string | undefined }>`
  flex: 0 0 ${({ size }) => size / 2}px;
  width: ${({ size }) => size / 2}px;
  height: ${({ size }) => size / 2}px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  right: ${({ size }) => size / 20}px;
  bottom: ${({ size }) => size / 20}px;
  border-radius: 50%;
  ${({ bgColor }) => bgColor ? `background: ${bgColor};` : ''};
  padding-top: 2px;
`;

const ModeratorBadgeIcon = styled(Icon)<{ size: number}>`
  color: ${colors.clRedError};
  fill: ${colors.clRedError};
  height: ${({ size }) => (size / 2) - 5}px;
`;

const VerifiedBadgeContainer = styled.div<{ size: number, bgColor: string | undefined }>`
  flex: 0 0 ${({ size }) => size / 2.3}px;
  width: ${({ size }) => size / 2.3}px;
  height: ${({ size }) => size / 2.3}px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  right: 0;
  bottom: 0;
  border-radius: 50%;
  ${({ bgColor }) => bgColor ? `background: ${bgColor};` : ''};
`;

const VerifiedBadgeIcon = styled(Icon)<{ bgColor: string | undefined, size: number }>`
  color: ${colors.clGreen};
  fill: ${colors.clGreen};
  ${({ bgColor }) => bgColor ? `stroke: ${bgColor};` : ''};
  height: 100%;
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
  bgColor?: string;
  className?: string;
  moderator?: boolean | null;
  verified?: boolean | null;
}

interface DataProps {
  user: GetUserChildProps;
}

interface Props extends InputProps, DataProps { }

interface State { }

class Avatar extends PureComponent<Props & InjectedIntlProps, State> {
  static defaultProps = {
    hasHoverEffect: false,
    padding: '3px',
    fillColor: lighten(0.2, colors.label),
    fillHoverColor: colors.label,
    borderThickness: '1px',
    borderColor: 'transparent',
    borderHoverColor: colors.label,
    bgColor: '#fff'
  };

  handleOnClick = (event: FormEvent) => {
    if (this.props.onClick) {
      this.props.onClick(event);
    }
  }

  render() {
    let { hasHoverEffect } = this.props;
    const { hideIfNoAvatar, user, size, onClick, padding, fillColor, fillHoverColor, borderThickness, borderColor, borderHoverColor, bgColor, moderator, className, verified } = this.props;

    if (!isNilOrError(user) && hideIfNoAvatar !== true) {
      hasHoverEffect = (isFunction(onClick) || hasHoverEffect);
      const imageSize = (parseInt(size, 10) > 160 ? 'large' : 'medium');
      const avatarSrc = user.attributes.avatar && user.attributes.avatar[imageSize];
      const userName = getUserName(user);
      const containerSize = `${parseInt(size, 10) + (parseInt(padding as string, 10) * 2) + (parseInt(borderThickness as string, 10) * 2)}px`;
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
          bgColor={bgColor}
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
            />
          )}
          {moderator && (
            <ModeratorBadgeContainer size={numberSize} bgColor={bgColor}>
              <ModeratorBadgeIcon name="clLogo" size={numberSize} />
            </ModeratorBadgeContainer>
          )}
          {user.attributes.is_verified && verified && (
            <FeatureFlag name="verification">
              <VerifiedBadgeContainer size={numberSize} bgColor={bgColor}>
                <VerifiedBadgeIcon name="checkmark-full" size={numberSize} bgColor={bgColor} />
              </VerifiedBadgeContainer>
            </FeatureFlag>
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
