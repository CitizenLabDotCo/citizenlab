/*
 * This component is invisible to screen readers, if you ever need to show it to
 * screen readers, please adapt inner content to be intelligible before removing aria-hidden prop
 */

import React, { memo } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import { Icon } from 'cl2-component-library';
import FeatureFlag from 'components/FeatureFlag';
import Link from 'utils/cl-router/Link';

// hooks
import useUser from 'hooks/useUser';

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
  padding: number;
  bgColor: string | undefined;
  borderColor: string | undefined;
  borderThickness: number;
  borderHoverColor: string | undefined;
}>`
  flex: 0 0 ${({ size }) => size}px;
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  padding: ${({ padding }) => padding}px;
  border-radius: 50%;
  border-style: ${({ borderThickness }) =>
    borderThickness === 0 ? 'none' : 'solid'};
  border-width: ${({ borderThickness }) => `${borderThickness}px`};
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
  padding: number;
  bgColor: string | undefined;
  borderColor: string | undefined;
  borderThickness: number;
  borderHoverColor: string | undefined;
}>`
  flex: 0 0 ${({ size }) => size}px;
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  fill: ${({ fillColor }) => fillColor || ''};
  padding: ${({ padding }) => padding}px;
  border-radius: 50%;
  border-style: ${({ borderThickness }) =>
    borderThickness === 0 ? 'none' : 'solid'};
  border-width: ${({ borderThickness }) => `${borderThickness}px`};
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

interface Props {
  userId: string | null;
  size: number;
  isLinkToProfile?: boolean;
  fillColor?: string;
  borderThickness?: number;
  borderColor?: string;
  bgColor?: string;
  className?: string;
  moderator?: boolean | null;
  addVerificationBadge?: boolean | null;
  padding?: number;
  hideIfNoAvatar?: boolean;
}

const Avatar = memo(
  ({
    isLinkToProfile,
    moderator,
    className,
    addVerificationBadge,
    userId,
    hideIfNoAvatar,
    ...props
  }: Props & InjectedIntlProps) => {
    const user = useUser({ userId });

    if (!isNilOrError(user)) {
      const { slug, avatar, verified } = user.attributes;
      const profileLink = `/profile/${slug}`;
      // In dev mode, slug is sometimes undefined,
      // while !isNilOrError(user) passes... To be solved properly
      const hasValidProfileLink = profileLink !== '/profile/undefined';
      const avatarSize = props.size;
      const padding = props.padding || 3;
      const borderThickness = props.borderThickness || 1;
      const hasHoverEffect = (isLinkToProfile && hasValidProfileLink) || false;
      const imageSizeLabel = avatarSize > 160 ? 'large' : 'medium';
      const avatarSrc = avatar ? avatar[imageSizeLabel] : null;
      const containerSize = avatarSize + padding * 2 + borderThickness * 2;
      const badgeSize = avatarSize / (avatarSize < 40 ? 1.8 : 2.3);
      const fillColor = props.fillColor || lighten(0.2, colors.label);
      const fillHoverColor = colors.label;
      const borderHoverColor = colors.label;
      const borderColor = props.borderColor || 'transparent';
      const bgColor = props.bgColor || 'transparent';

      if (!avatarSrc && hideIfNoAvatar) {
        return null;
      }

      const AvatarComponent = (
        <Container aria-hidden className={className} size={containerSize}>
          {avatarSrc && (
            <AvatarImage
              className={`avatarImage ${
                hasHoverEffect ? 'hasHoverEffect' : ''
              }`}
              src={avatarSrc}
              alt=""
              size={containerSize}
              borderThickness={borderThickness}
              borderColor={borderColor}
              borderHoverColor={
                moderator ? colors.clRedError : borderHoverColor
              }
              bgColor={bgColor}
              padding={padding}
            />
          )}

          {!avatarSrc && !hideIfNoAvatar && (
            <AvatarIcon
              className={`avatarIcon ${hasHoverEffect ? 'hasHoverEffect' : ''}`}
              name="user"
              size={containerSize}
              fillColor={fillColor}
              fillHoverColor={fillHoverColor}
              borderThickness={borderThickness}
              borderColor={borderColor}
              borderHoverColor={
                moderator ? colors.clRedError : borderHoverColor
              }
              bgColor={bgColor}
              padding={padding}
            />
          )}

          {moderator && (
            <BadgeIcon
              name="clShield"
              size={badgeSize}
              fill={colors.clRedError}
            />
          )}

          {verified && addVerificationBadge && (
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
);

export default injectIntl(Avatar);
