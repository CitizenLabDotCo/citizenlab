/*
 * This component is invisible to screen readers, if you ever need to show it to
 * screen readers, please adapt inner content to be intelligible before removing aria-hidden prop
 */

import React, { PureComponent } from 'react';
import { isNumber } from 'lodash-es';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// components
import { Icon } from 'cl2-component-library';
import FeatureFlag from 'components/FeatureFlag';
import Link from 'utils/cl-router/Link';

// resources
import GetUser, { GetUserChildProps } from 'resources/GetUser';

// i18n
import injectIntl from 'utils/cl-intl/injectIntl';
import { InjectedIntlProps } from 'react-intl';

// styles
import styled from 'styled-components';
import { lighten } from 'polished';
import { colors } from 'utils/styleUtils';

export const Container = styled.div<{ size: number }>`
  flex: 0 0 ${({ size }) => size}px;
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
`;

export const AvatarImage = styled.img<{
  size: number;
  padding: number | undefined;
  bgColor: string | undefined;
  borderColor: string | undefined;
  borderThickness: number | undefined;
  borderHoverColor: string | undefined;
}>`
  flex: 0 0 ${({ size }) => size}px;
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  padding: ${({ padding }) => (isNumber(padding) ? padding : 3)}px;
  border-radius: 50%;
  border-style: ${({ borderThickness }) =>
    borderThickness === 0 ? 'none' : 'solid'};
  border-width: ${({ borderThickness }) =>
    isNumber(borderThickness) ? borderThickness : 1}px;
  border-color: ${({ borderColor }) => borderColor || 'transparent'};
  background: ${({ bgColor }) => bgColor || 'transparent'};

  &.hasHoverEffect {
    cursor: pointer;
    transition: all 100ms ease-out;

    &:hover {
      border-color: ${({ borderHoverColor }) =>
        borderHoverColor || 'transparent'};
    }
  }
`;

const AvatarIcon = styled(Icon)<{
  size: number;
  fillColor: string | undefined;
  fillHoverColor: string | undefined;
  padding: number | undefined;
  bgColor: string | undefined;
  borderColor: string | undefined;
  borderThickness: number | undefined;
  borderHoverColor: string | undefined;
}>`
  flex: 0 0 ${({ size }) => size}px;
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  fill: ${({ fillColor }) => fillColor || ''};
  padding: ${({ padding }) => (isNumber(padding) ? padding : 3)}px;
  border-radius: 50%;
  border-style: ${({ borderThickness }) =>
    borderThickness === 0 ? 'none' : 'solid'};
  border-width: ${({ borderThickness }) =>
    isNumber(borderThickness) ? borderThickness : 1}px;
  border-color: ${({ borderColor }) => borderColor || 'transparent'};
  background: ${({ bgColor }) => bgColor || 'transparent'};

  &.hasHoverEffect {
    cursor: pointer;
    transition: all 100ms ease-out;

    &:hover {
      border-color: ${({ borderHoverColor }) =>
        borderHoverColor || 'transparent'};
      fill: ${({ fillHoverColor }) => fillHoverColor || ''};
    }
  }
`;

const BadgeIcon = styled(Icon)<{ size: number; fill: string }>`
  fill: ${({ fill }) => fill};
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  position: absolute;
  right: 0px;
  bottom: 0px;
  border-radius: 50%;
  background: #fff;
  border: solid 2px #fff;
`;

interface InputProps {
  userId: string | null;
  size: string;
  badgeSize?: string;
  isLinkToProfile?: boolean;
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
    bgColor: 'transparent',
  };

  render() {
    const {
      hideIfNoAvatar,
      user,
      isLinkToProfile,
      fillColor,
      fillHoverColor,
      borderColor,
      borderHoverColor,
      bgColor,
      moderator,
      className,
      verified,
    } = this.props;

    if (!isNilOrError(user)) {
      const profileLink = `/profile/${user.attributes.slug}`;
      // In dev mode, user.attributes.slug is sometimes undefined,
      // while !isNilOrError(user) passes... To be solved properly
      const hasValidProfileLink = profileLink !== '/profile/undefined';
      const size = parseInt(this.props.size, 10);
      const padding = parseInt(this.props.padding as string, 10);
      const borderThickness = parseInt(
        this.props.borderThickness as string,
        10
      );
      const hasHoverEffect = !!(
        (isLinkToProfile && hasValidProfileLink) ||
        this.props.hasHoverEffect
      );
      const imageSize = size > 160 ? 'large' : 'medium';
      const avatarSrc =
        user.attributes.avatar && user.attributes.avatar[imageSize];
      const containerSize = size + padding * 2 + borderThickness * 2;
      const badgeSize = this.props.badgeSize
        ? parseInt(this.props.badgeSize, 10)
        : size / (size < 40 ? 1.8 : 2.3);

      if (!avatarSrc && hideIfNoAvatar) {
        return null;
      }

      const AvatarComponent = (
        <Container aria-hidden className={className} size={containerSize}>
          {avatarSrc ? (
            <AvatarImage
              className={`avatarImage ${
                hasHoverEffect ? 'hasHoverEffect' : ''
              }`}
              src={avatarSrc}
              alt=""
              size={containerSize}
              padding={padding}
              borderThickness={borderThickness}
              borderColor={borderColor}
              borderHoverColor={
                moderator ? colors.clRedError : borderHoverColor
              }
              bgColor={bgColor}
            />
          ) : (
            <AvatarIcon
              className={`avatarIcon ${hasHoverEffect ? 'hasHoverEffect' : ''}`}
              name="user"
              size={containerSize}
              fillColor={fillColor}
              fillHoverColor={fillHoverColor}
              padding={padding}
              borderThickness={borderThickness}
              borderColor={borderColor}
              borderHoverColor={
                moderator ? colors.clRedError : borderHoverColor
              }
              bgColor={bgColor}
            />
          )}

          {moderator && (
            <BadgeIcon
              name="clShield"
              size={badgeSize}
              fill={colors.clRedError}
            />
          )}

          {user.attributes.verified && verified && (
            <FeatureFlag name="verification">
              <BadgeIcon
                name="checkmark-full"
                size={badgeSize}
                fill={colors.clGreen}
              />
            </FeatureFlag>
          )}
        </Container>
      );

      if (isLinkToProfile && hasValidProfileLink) {
        return <Link to={profileLink}>{AvatarComponent}</Link>;
      }

      return AvatarComponent;
    }

    return null;
  }
}

const Data = adopt<DataProps, InputProps>({
  user: ({ userId, render }) => <GetUser id={userId}>{render}</GetUser>,
});

const AvatarWithHoc = injectIntl<Props>(Avatar);

const WrappedAvatar = (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <AvatarWithHoc {...inputProps} {...dataProps} />}
  </Data>
);

export default WrappedAvatar;
