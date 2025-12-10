import React from 'react';

import { Box, Image } from '@citizenlab/cl2-component-library';

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

  return <Box w="48px" h="48px" borderRadius="4px" bgColor="#E5E7EB" />;
};

export default IdeaThumbnail;
