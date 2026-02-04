import React from 'react';

import { Box, colors, Text } from '@citizenlab/cl2-component-library';
import { FontSizesType } from 'component-library/utils/styleUtils';
import { isNumber } from 'lodash-es';
import styled from 'styled-components';

import { IAvatarData } from 'api/avatars/types';
import useAvatarsWithIds from 'api/avatars/useAvatarsWithIds';
import useRandomAvatars from 'api/avatars/useRandomAvatars';

import { ScreenReaderOnly } from 'utils/a11y';
import { useIntl } from 'utils/cl-intl';

import { OuterContainer, BubbleContainer } from './Containers';
import messages from './messages';
import placeholderImage from './user.png';
import { getFontSize } from './utils';

export const AvatarImageBubble = styled.img<{
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
  participantsTextFontSize?: FontSizesType;
  userCountBubbleFontSize?: number;
}

export const AvatarBubbles = ({
  avatarIds,
  context,
  size = 34,
  overlap = 12,
  className,
  userCount,
  showParticipantText = true,
  participantsTextFontSize = 's',
  limit = 4,
  userCountBubbleFontSize,
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

  const bubbleSize = size + 4;
  const imageSize = bubbleSize > 160 ? 'large' : 'medium';

  if (avatars && isNumber(currentUserCount) && currentUserCount > 0) {
    const avatarsWithImage = avatars.filter(
      (avatar) => avatar.attributes.avatar[imageSize]
    ) as IAvatarData[];

    let avatarsToShow = avatarsWithImage;

    if (
      avatarsWithImage.length < limit &&
      avatarsWithImage.length < currentUserCount
    ) {
      const placeholdersNeeded =
        Math.min(currentUserCount, limit) - avatarsWithImage.length;
      avatarsToShow = [
        ...avatarsWithImage,
        ...new Array(placeholdersNeeded).fill({
          attributes: { avatar: { [imageSize]: placeholderImage } },
        }),
      ];
    } else if (avatarsWithImage.length > limit) {
      avatarsToShow = avatarsWithImage.slice(0, limit);
    }

    const avatarImagesCount = avatarsToShow.length;
    const remainingUsers = currentUserCount - avatarImagesCount;

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
        <OuterContainer bubbleSize={bubbleSize} className={className}>
          <BubbleContainer
            bubbleSize={bubbleSize}
            overlap={overlap}
            avatarImagesCount={avatarImagesCount}
          >
            {avatarsToShow.map((avatar, index) => (
              <AvatarImageBubble
                key={index}
                index={index}
                overlap={overlap}
                size={bubbleSize}
                width={bubbleSize}
                height={bubbleSize}
                src={avatar.attributes.avatar[imageSize]}
                alt=""
                data-testid="avatarImageBubble"
              />
            ))}
          </BubbleContainer>
          {remainingUsers > 0 &&
            (showParticipantText ? (
              <Box
                data-testid="userCountBubbleInner"
                ml="4px"
                display="flex"
                alignItems="center"
              >
                <Text
                  fontSize={participantsTextFontSize}
                  textAlign="left"
                  my="0px"
                  aria-hidden="true"
                  color="coolGrey600"
                >
                  +{truncatedUserCount}
                  {letterAbbreviation}&nbsp;
                  {formatMessage(
                    truncatedUserCount > 1 || letterAbbreviation
                      ? messages.participants1
                      : messages.participant
                  )}
                </Text>
              </Box>
            ) : (
              <Box
                w={`${bubbleSize}px`}
                h={`${bubbleSize}px`}
                display="flex"
                alignItems="center"
                justifyContent="center"
                pb="0px"
                borderRadius="50%"
                border={`solid 2px ${colors.white}`}
                bg={colors.textSecondary}
                zIndex={`${avatarsWithImage.length + 1}`}
                left={`${avatarsWithImage.length * (bubbleSize - overlap)}px`}
              >
                <Box
                  aria-hidden
                  data-testid="userCountBubbleInner"
                  display="flex"
                >
                  <Text
                    color="white"
                    display="flex"
                    m="0"
                    style={{
                      fontSize:
                        userCountBubbleFontSize ??
                        getFontSize(
                          bubbleSize,
                          remainingUsers.toString().length
                        ),
                    }}
                  >
                    +{truncatedUserCount}
                    {letterAbbreviation}
                  </Text>
                </Box>
                <ScreenReaderOnly>
                  {formatMessage(messages.numberOfUsers, {
                    numberOfUsers: currentUserCount,
                  })}
                </ScreenReaderOnly>
              </Box>
            ))}
          <ScreenReaderOnly>
            {formatMessage(messages.numberOfParticipants1, {
              numberOfParticipants: currentUserCount,
            })}
          </ScreenReaderOnly>
        </OuterContainer>
      );
    }
  } else if (avatars !== undefined) {
    return <div className={className} />;
  }

  return null;
};

export default AvatarBubbles;
