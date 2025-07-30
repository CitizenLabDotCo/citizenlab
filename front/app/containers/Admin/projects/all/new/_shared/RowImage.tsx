import React from 'react';

import { Box, Image } from '@citizenlab/cl2-component-library';

interface Props {
  imageUrl?: string;
  alt: string;
}

const RowImage = ({ imageUrl, alt }: Props) => {
  return (
    <Box
      width="32px"
      height="32px"
      display="flex"
      position="relative"
      overflow="hidden"
      borderRadius="4px"
    >
      {imageUrl && (
        <Image
          src={imageUrl}
          alt={alt}
          position="absolute"
          width="100%"
          height="100%"
          top="0"
          left="0"
        />
      )}
    </Box>
  );
};

export default RowImage;
