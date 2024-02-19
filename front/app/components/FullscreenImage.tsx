import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Box,
  IconButton,
  Image,
  colors,
} from '@citizenlab/cl2-component-library';

interface Props {
  src: string;
  altText: string;
}

const FullscreenImage = ({ src, altText }: Props) => {
  const [fullscreen, setFullscreen] = useState(false);

  const toggleFullscreen = () => {
    setFullscreen(!fullscreen);
  };

  const modalPortalElement = document?.getElementById('modal-portal');

  if (fullscreen && modalPortalElement) {
    return createPortal(
      <Box
        position="fixed"
        top="0"
        left="0"
        width="100vw"
        height="100%"
        background="rgba(0, 0, 0, 0.8)"
        zIndex="2"
        display="flex"
        justifyContent="center"
        alignItems="center"
        onClick={toggleFullscreen}
      >
        <Image
          src={src}
          alt={altText}
          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
        />
      </Box>,
      document.body
    );
  }

  return (
    <Box position="relative" display="inline-block">
      <Box position="relative">
        <Box maxWidth="100%" maxHeight="100%">
          <Image
            src={src}
            alt={altText}
            style={{ maxWidth: '100%', maxHeight: '100%' }}
          />
        </Box>
        {!fullscreen && (
          <Box
            position="absolute"
            right="8px"
            bottom="8px"
            borderRadius="4px"
            background={colors.white}
            onClick={toggleFullscreen}
          >
            <IconButton
              buttonType="button"
              iconName="layout-white-space"
              a11y_buttonActionMessage={
                'formatMessage(messages.a11y_removeFile)'
              }
              onClick={toggleFullscreen}
              iconColor={colors.textSecondary}
              iconColorOnHover={colors.primary}
              iconWidth="16px"
            />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default FullscreenImage;
