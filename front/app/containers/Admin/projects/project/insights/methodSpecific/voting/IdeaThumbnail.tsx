import React from 'react';

import { Box, Image, colors } from '@citizenlab/cl2-component-library';

interface Props {
  imageUrl?: string;
  alt: string;
}

const IdeaThumbnail = ({ imageUrl, alt }: Props) => {
  if (imageUrl) {
    return (
      <Image
        src={imageUrl}
        alt={alt}
        w="48px"
        h="48px"
        borderRadius="4px"
        objectFit="cover"
      />
    );
  }

  return <Box w="48px" h="48px" borderRadius="4px" bgColor={colors.grey200} />;
};

export default IdeaThumbnail;
