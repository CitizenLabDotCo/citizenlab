import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { isNumber } from 'lodash-es';
import styled from 'styled-components';

import { IAvatarData } from 'api/avatars/types';
import useAvatarsWithIds from 'api/avatars/useAvatarsWithIds';
import useRandomAvatars from 'api/avatars/useRandomAvatars';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import placeholderImage from './user.png';

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
  z-index: ${(props) => props.index + 1};
  // left: ${(props) => props.index * (props.size - props.overlap)}px;
  object-fit: cover;
  object-position: center;
`;

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
  userCount,
}: Props) => {
  const { formatMessage } = useIntl();
  const { data: randomAvatars } = useRandomAvatars({
    limit: defaultLimit,
    context_type: context?.type,
    context_id: context?.id,
    enabled: !avatarIds,
  });

  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        avatar &&
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        avatar.attributes?.avatar &&
        avatar.attributes.avatar[imageSize]
    ) as IAvatarData[];

    let avatarsToShow = avatarsWithImage;

    // Use placeholder images only if there are less than 3 real avatars
    if (avatarsWithImage.length < 3) {
      const placeholdersNeeded = 3 - avatarsWithImage.length;
      avatarsToShow = [
        ...avatarsWithImage,
        ...new Array(placeholdersNeeded).fill({
          attributes: { avatar: { [imageSize]: placeholderImage } },
        }),
      ];
    }

    const avatarImagesCount = avatarsToShow.length;
    const remainingUsers = currentUserCount - avatarImagesCount;
    const containerHeight = bubbleSize + 2;
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
        <Box
          className={className}
          height={`${containerHeight}px`}
          data-testid="avatarBubblesContainer"
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexShrink={0}
        >
          <Box display="flex">
            {avatarsToShow.map((avatar, index) => (
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
          </Box>
          {remainingUsers > 0 && (
            <Box>
              +{truncatedUserCount}
              {letterAbbreviation}&nbsp;
              {formatMessage(messages.participants)}
            </Box>
          )}
        </Box>
      );
    }
  } else if (avatars !== undefined) {
    return <div className={className} />;
  }

  return null;
};

export default AvatarBubbles;
