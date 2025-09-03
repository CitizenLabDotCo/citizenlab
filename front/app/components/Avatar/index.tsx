import React, { memo } from 'react';

import { Box, Icon, colors } from '@citizenlab/cl2-component-library';
import BoringAvatar from 'boring-avatars';
import { lighten } from 'polished';
import { RouteType } from 'routes';
import styled, { useTheme } from 'styled-components';

import useUserById from 'api/users/useUserById';

import FeatureFlag from 'components/FeatureFlag';

import { ScreenReaderOnly } from 'utils/a11y';
import { FormattedMessage } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
import { isNilOrError } from 'utils/helperUtils';
import { getFullName } from 'utils/textUtils';

import messages from './messages';

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
  paddingValue: number;
  bgColor: string | undefined;
  borderColor: string | undefined;
  borderThickness: number;
  borderHoverColor: string | undefined;
}>`
  flex: 0 0 ${({ size }) => size}px;
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  fill: ${({ fillColor }) => fillColor || ''};
  padding: ${({ paddingValue }) => paddingValue}px;
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

export interface Props {
  userId: string | null;
  size: number;
  isLinkToProfile?: boolean;
  fillColor?: string;
  borderThickness?: number;
  borderColor?: string;
  bgColor?: string;
  className?: string;
  showModeratorStyles?: boolean | null;
  addVerificationBadge?: boolean | null;
  padding?: number;
  authorHash?: string;
}

const Avatar = memo(
  ({ isLinkToProfile, userId, authorHash, ...props }: Props) => {
    const { data: user } = useUserById(userId);
    if (isNilOrError(user)) {
      return (
        <AvatarInner
          userId={userId}
          isLinkToProfile={isLinkToProfile}
          authorHash={authorHash}
          {...props}
        />
      );
    }

    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const slug = user?.data.attributes.slug;
    const profileLink: RouteType = `/profile/${slug}`;
    const hasValidProfileLink = profileLink !== '/profile/undefined';

    if (isLinkToProfile && hasValidProfileLink) {
      return (
        <Link to={profileLink} scrollToTop>
          <ScreenReaderOnly>
            <FormattedMessage
              {...messages.titleForAccessibility}
              values={{ fullName: getFullName(user.data) }}
            />
          </ScreenReaderOnly>
          <AvatarInner
            userId={userId}
            isLinkToProfile={isLinkToProfile}
            {...props}
          />
        </Link>
      );
    }

    return (
      <AvatarInner
        userId={userId}
        isLinkToProfile={isLinkToProfile}
        {...props}
      />
    );
  }
);

const AvatarInner = ({
  isLinkToProfile,
  showModeratorStyles,
  className,
  addVerificationBadge,
  userId,
  authorHash,
  ...props
}: Props) => {
  const { data: user } = useUserById(userId);
  const theme = useTheme();

  const avatarSize = props.size;
  const paddingValue = props.padding || 3;
  const borderThickness = props.borderThickness || 1;
  const imageSizeLabel = avatarSize > 160 ? 'large' : 'medium';
  const containerSize = avatarSize + paddingValue * 2 + borderThickness * 2;
  const badgeSize = avatarSize / (avatarSize < 40 ? 1.8 : 2.3);
  const fillColor = props.fillColor || lighten(0.2, colors.textSecondary);
  const fillHoverColor = colors.textSecondary;
  const borderHoverColor = colors.textSecondary;
  const borderColor = props.borderColor || 'transparent';
  const bgColor = props.bgColor || 'transparent';

  if (isNilOrError(user)) {
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (authorHash === null) {
      return null;
    } else {
      return (
        <Container aria-hidden className={className} size={containerSize}>
          <Box padding={paddingValue.toString()}>
            <BoringAvatar
              size={avatarSize}
              name={authorHash}
              variant="bauhaus"
              colors={[
                theme.colors.tenantPrimary,
                theme.colors.tenantSecondary,
                colors.grey300,
                lighten(0.3, theme.colors.tenantPrimary),
                lighten(0.3, theme.colors.tenantSecondary),
              ]}
            />
          </Box>
        </Container>
      );
    }
  }

  // In dev mode, slug is sometimes undefined,
  // while !isNilOrError(user) passes... To be solved properly
  const { slug, avatar, verified } = user.data.attributes;
  const profileLink = `/profile/${slug}`;
  const hasValidProfileLink = profileLink !== '/profile/undefined';
  const hasHoverEffect = (isLinkToProfile && hasValidProfileLink) || false;
  const avatarSrc = avatar ? avatar[imageSizeLabel] : null;

  return (
    <Container aria-hidden className={className} size={containerSize}>
      {avatarSrc ? (
        <AvatarImage
          className={`avatarImage ${hasHoverEffect ? 'hasHoverEffect' : ''}`}
          src={avatarSrc}
          alt=""
          size={containerSize}
          borderThickness={borderThickness}
          borderColor={borderColor}
          borderHoverColor={
            showModeratorStyles ? colors.red600 : borderHoverColor
          }
          bgColor={bgColor}
          padding={paddingValue}
        />
      ) : (
        <AvatarIcon
          className={`avatarIcon ${hasHoverEffect ? 'hasHoverEffect' : ''}`}
          name="user-circle"
          size={containerSize}
          fillColor={fillColor}
          fillHoverColor={fillHoverColor}
          borderThickness={borderThickness}
          borderColor={borderColor}
          borderHoverColor={
            showModeratorStyles ? colors.red600 : borderHoverColor
          }
          bgColor={bgColor}
          paddingValue={paddingValue}
        />
      )}

      {showModeratorStyles && (
        <BadgeIcon name="cl-favicon" size={badgeSize} fill={colors.red600} />
      )}

      {verified && addVerificationBadge && (
        <FeatureFlag name="verification">
          <BadgeIcon
            name="check-circle"
            size={badgeSize}
            fill={colors.success}
          />
        </FeatureFlag>
      )}
    </Container>
  );
};

export default Avatar;
