import React from 'react';
import { isNumber } from 'lodash-es';

// services
import { IAvatarData } from 'api/avatars/types';

// resources

// i18n
import messages from './messages';

// styling
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';
import { ScreenReaderOnly } from 'utils/a11y';
import useRandomAvatars from 'api/avatars/useRandomAvatars';
import useAvatarsWithIds from 'api/avatars/useAvatarsWithIds';
import { useIntl } from 'utils/cl-intl';

const getFontSize = (size: number, digits: number) => {
  if (size >= 34) {
    if (digits <= 2) {
      return 14;
    }

    if (digits === 3) {
      return 12;
    }

    if (digits >= 4) {
      return 11;
    }
  } else {
    if (digits <= 2) {
      return 12;
    }

    if (digits === 3) {
      return 11;
    }

    if (digits >= 4) {
      return 10;
    }
  }

  return 14;
};

const EmptyContainer = styled.div``;

const Container = styled.div<{ width: number; height: number }>`
  flex-shrink: 0;
  width: ${(props) => props.width}px;
  height: ${(props) => props.height}px;
  position: relative;
`;

const AvatarImageBubble = styled.img<{
  overlap: number;
  index: number;
  size: number;
}>`
  width: ${(props) => props.size}px;
  height: ${(props) => props.size}px;
  border-radius: 50%;
  border: solid 2px #fff;
  text-indent: -9999px;
  position: absolute;
  z-index: ${(props) => props.index + 1};
  left: ${(props) => props.index * (props.size - props.overlap)}px;
  object-fit: cover;
  object-position: center;
`;

const UserCountBubble = styled.div<{
  overlap: number;
  index: number;
  size: number;
  bgColor: string;
}>`
  width: ${(props) => props.size}px;
  height: ${(props) => props.size}px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-bottom: 0;
  border-radius: 50%;
  border: solid 2px #fff;
  background: ${(props) => props.bgColor};
  position: absolute;
  z-index: ${(props) => props.index + 1};
  left: ${(props) => props.index * (props.size - props.overlap)}px;
`;

const UserCountBubbleInner = styled.div<{ size: number; digits: number }>`
  color: #fff;
  font-size: ${({ size, digits }) => getFontSize(size, digits)}px;
  font-weight: 500;
  display: flex;
`;

/* InputProps
 * limit: the number of avatars you need, you'll get one extra bubble with the remaining count, defaults to 3
 * context: extra info if you use the component in a specific context, defaults to platform-wide
 * size: image size, each bubble will be 4px bigger because of margins, defaults to 30px
 * overlap: the number of pixel the bubbles overlap, defaults to 7
 */
interface Props {
  limit?: number;
  context?: {
    type: 'project' | 'group';
    id: string;
  };
  size?: number;
  overlap?: number;
  userCountBgColor?: string;
  avatarIds?: string[];
  className?: string;
  userCount?: number;
}

const defaultLimit = 4;

export const AvatarBubbles = ({
  avatarIds,
  context,
  size = 34,
  overlap,
  className,
  userCountBgColor = colors.textSecondary,
  userCount,
}: Props) => {
  const { formatMessage } = useIntl();
  const { data: randomAvatars } = useRandomAvatars({
    limit: defaultLimit,
    context_type: context?.type,
    context_id: context?.id,
    enabled: !avatarIds,
  });

  const currentUserCount = userCount || randomAvatars?.meta?.total;

  const avatarsWithIdsQueries = useAvatarsWithIds(avatarIds);

  const avatarsWithIds = avatarsWithIdsQueries
    .filter((query) => query.data !== undefined)
    .map((query) => {
      return query.data?.data;
    }) as IAvatarData[];

  const avatars = avatarIds ? avatarsWithIds : randomAvatars?.data;

  if (avatars && isNumber(currentUserCount) && currentUserCount > 0) {
    const bubbleSize = size + 4;
    const bubbleOverlap = overlap || 10;
    const imageSize = bubbleSize > 160 ? 'large' : 'medium';

    const avatarsWithImage = avatars.filter(
      (avatar) =>
        avatar &&
        avatar.attributes?.avatar &&
        avatar.attributes.avatar[imageSize]
    ) as IAvatarData[];

    const avatarImagesCount = avatarsWithImage.length;
    const remainingUsers = currentUserCount - avatarImagesCount;
    const remainingUsersDigits = remainingUsers.toString().length;
    const bubblesCount = avatarImagesCount + (remainingUsers > 0 ? 1 : 0);
    const containerHeight = bubbleSize + 2;
    const containerWidth =
      bubblesCount * (bubbleSize - bubbleOverlap) + bubbleOverlap + 2;

    let letterAbbreviation = '';
    let truncatedUserCount = remainingUsers;

    switch (true) {
      case remainingUsers >= 1000000:
        letterAbbreviation = 'M';
        truncatedUserCount = Math.round((remainingUsers / 1000000) * 10) / 10;
        break;
      case remainingUsers >= 100000:
        letterAbbreviation = 'k';
        truncatedUserCount = Math.floor(remainingUsers / 1000);
        break;
      case remainingUsers >= 10000:
        letterAbbreviation = 'k';
        truncatedUserCount = Math.round((remainingUsers / 1000) * 10) / 10;
        break;
    }

    if (avatarIds || context || avatarImagesCount > 0) {
      return (
        <Container
          className={className}
          width={containerWidth}
          height={containerHeight}
          data-testid="avatarBubblesContainer"
        >
          {avatarsWithImage.map((avatar, index) => (
            <AvatarImageBubble
              key={index}
              index={index}
              overlap={bubbleOverlap}
              size={bubbleSize}
              src={avatar.attributes.avatar[imageSize]}
              alt=""
              data-testid="avatarImageBubble"
            />
          ))}
          {remainingUsers > 0 && (
            <UserCountBubble
              index={avatarsWithImage.length}
              overlap={bubbleOverlap}
              size={bubbleSize}
              bgColor={userCountBgColor}
            >
              <UserCountBubbleInner
                size={bubbleSize}
                digits={remainingUsersDigits}
                aria-hidden
                data-testid="userCountBubbleInner"
              >
                +{truncatedUserCount}
                {letterAbbreviation}
              </UserCountBubbleInner>
              <ScreenReaderOnly>
                {formatMessage(messages.numberOfUsers, {
                  numberOfUsers: currentUserCount,
                })}
              </ScreenReaderOnly>
            </UserCountBubble>
          )}
        </Container>
      );
    }
  } else if (avatars !== undefined) {
    return <EmptyContainer className={className} />;
  }

  return null;
};

export default AvatarBubbles;
