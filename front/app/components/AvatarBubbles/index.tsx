import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';
import { isNumber } from 'lodash-es';
import styled from 'styled-components';

import { IAvatarData } from 'api/avatars/types';
import useAvatarsWithIds from 'api/avatars/useAvatarsWithIds';
import useRandomAvatars from 'api/avatars/useRandomAvatars';

import { ScreenReaderOnly } from 'utils/a11y';
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
  position: absolute; /* Absolute positioning for stacking */
  left: ${(props) =>
    props.index *
    (props.size - props.overlap)}px; /* Calculate left to overlap */
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
  avatarIds?: string[];
  className?: string;
  userCount?: number;
  showParticipantText?: boolean;
}

export const AvatarBubbles = ({
  avatarIds,
  context,
  size = 34,
  overlap = 12,
  className,
  userCount,
  showParticipantText = true,
  limit = 4,
}: Props) => {
  const { formatMessage } = useIntl();
  const { data: randomAvatars } = useRandomAvatars({
    limit,
    context_type: context?.type,
    context_id: context?.id,
    enabled: !avatarIds,
  });

  const currentUserCount = userCount || randomAvatars?.meta.total;
  const avatarsWithIdsQueries = useAvatarsWithIds(avatarIds);

  const avatarsWithIds = avatarsWithIdsQueries
    .filter((query) => query.data !== undefined)
    .map((query) => {
      return query.data?.data;
    }) as IAvatarData[];

  const avatars = avatarIds ? avatarsWithIds : randomAvatars?.data;

  if (avatars && isNumber(currentUserCount) && currentUserCount > 0) {
    const bubbleSize = size + 4;
    const bubbleOverlap = overlap;
    const imageSize = bubbleSize > 160 ? 'large' : 'medium';

    const avatarsWithImage = avatars.filter(
      (avatar) => avatar.attributes.avatar[imageSize]
    ) as IAvatarData[];

    let avatarsToShow = avatarsWithImage;

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
          justifyContent="flex-start"
          flexShrink={0}
          style={{ lineHeight: `${containerHeight}px` }}
        >
          <Box
            display="flex"
            style={{
              position: 'relative',
              width: `${
                bubbleSize +
                (avatarImagesCount - 1) * (bubbleSize - bubbleOverlap)
              }px`,
              minWidth: `${bubbleSize}px`,
              height: `${containerHeight}px`,
            }}
            alignItems="center"
          >
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
          {showParticipantText && remainingUsers > 0 && (
            <Box
              data-testid="userCountBubbleInner"
              ml="4px"
              display="flex"
              alignItems="center"
            >
              <Text
                fontSize="s"
                textAlign="left"
                my="0px"
                aria-hidden="true"
                color="coolGrey600"
              >
                +{truncatedUserCount}
                {letterAbbreviation}&nbsp;
                {formatMessage(messages.participants)}
              </Text>
            </Box>
          )}
          <ScreenReaderOnly>
            {formatMessage(messages.numberOfParticipants, {
              numberOfParticipants: currentUserCount,
            })}
          </ScreenReaderOnly>
        </Box>
      );
    }
  } else if (avatars !== undefined) {
    return <div className={className} />;
  }

  return null;
};

export default AvatarBubbles;
