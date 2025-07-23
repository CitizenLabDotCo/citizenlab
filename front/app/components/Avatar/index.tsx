import React, { memo } from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';
import BoringAvatar from 'boring-avatars';
import { lighten } from 'polished';
import { RouteType } from 'routes';
import styled, { useTheme } from 'styled-components';

import useUserById from 'api/users/useUserById';

import { ScreenReaderOnly } from 'utils/a11y';
import { FormattedMessage } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
import { isNilOrError } from 'utils/helperUtils';
import { getFullName } from 'utils/textUtils';

import AvatarMarkup from './AvatarMarkup';
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

export interface Props {
  userId: string | null;
  size: number;
  isLinkToProfile?: boolean;
  fillColor?: string;
  borderThickness?: number;
  borderColor?: string;
  bgColor?: string;
  className?: string;
  showModeratorStyles?: boolean;
  addVerificationBadge?: boolean;
  padding?: number;
  authorHash?: string;
}

const AvatarOuter = memo(
  ({ isLinkToProfile, userId, authorHash, ...props }: Props) => {
    const { data: user } = useUserById(userId);
    if (isNilOrError(user)) {
      return (
        <Avatar
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
          <Avatar
            userId={userId}
            isLinkToProfile={isLinkToProfile}
            {...props}
          />
        </Link>
      );
    }

    return (
      <Avatar userId={userId} isLinkToProfile={isLinkToProfile} {...props} />
    );
  }
);

const Avatar = ({
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
    <AvatarMarkup
      className={className}
      containerSize={containerSize}
      avatarSrc={avatarSrc ?? undefined}
      hasHoverEffect={hasHoverEffect}
      borderThickness={borderThickness}
      borderColor={borderColor}
      borderHoverColor={borderHoverColor}
      showModeratorStyles={showModeratorStyles}
      bgColor={bgColor}
      paddingValue={paddingValue}
      fillColor={fillColor}
      fillHoverColor={fillHoverColor}
      badgeSize={badgeSize}
      verified={verified}
      addVerificationBadge={addVerificationBadge}
    />
  );
};

export default AvatarOuter;
