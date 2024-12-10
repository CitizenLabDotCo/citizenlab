import React from 'react';

import { Shimmer, colors } from '@citizenlab/cl2-component-library';

import { OuterContainer, BubbleContainer } from './Containers';

interface Props {
  bubbleSize?: number;
  overlap?: number;
  avatarImagesCount: number;
}

const Skeleton = ({
  bubbleSize = 38,
  overlap = 12,
  avatarImagesCount,
}: Props) => {
  return (
    <OuterContainer bubbleSize={bubbleSize}>
      <BubbleContainer
        bubbleSize={bubbleSize}
        overlap={overlap}
        avatarImagesCount={avatarImagesCount}
      >
        {[...Array(avatarImagesCount)].map((_, index) => (
          <Shimmer
            key={index}
            width={`${bubbleSize}px`}
            height={`${bubbleSize}px`}
            bgColor={colors.grey300}
            borderRadius="50%"
            left={`${index * (bubbleSize - overlap)}px`}
            position="absolute"
            border={`solid 2px #fff`}
            zIndex={`${index + 1}`}
          />
        ))}
      </BubbleContainer>
    </OuterContainer>
  );
};

export default Skeleton;
