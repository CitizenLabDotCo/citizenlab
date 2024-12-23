import React, { useCallback, useEffect, useRef, useState } from 'react';

import {
  Box,
  IconButton,
  Image,
  colors,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';
import { createPortal } from 'react-dom';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  src: string;
  altText: string;
}

const FullscreenImage = ({ src, altText }: Props) => {
  const [fullscreen, setFullscreen] = useState(false);
  const [isImagedLoaded, setIsImageLoaded] = useState(false);
  const isSmallerThanPhone = useBreakpoint('phone');
  const fullscreenButtonRef = useRef<HTMLButtonElement | null>(null);
  const { formatMessage } = useIntl();

  const toggleFullscreen = (event: React.MouseEvent) => {
    event.preventDefault(); // prevent the image option from being checked (selected)
    setFullscreen(!fullscreen);
  };

  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const modalPortalElement = document?.getElementById('modal-portal');

  const handleKeyup = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape' && fullscreen) {
        setFullscreen(false);
        fullscreenButtonRef.current?.focus();
      }
    },
    [setFullscreen, fullscreenButtonRef, fullscreen]
  );

  useEffect(() => {
    window.addEventListener('keyup', handleKeyup);
    return () => {
      window.removeEventListener('keyup', handleKeyup);
    };
  }, [handleKeyup]);

  if (fullscreen && modalPortalElement) {
    return createPortal(
      <Box
        position="fixed"
        top="0"
        left="0"
        width="100vw"
        height="100%"
        background="rgba(0, 0, 0, 0.8)"
        zIndex="1105"
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
    <Box
      position="relative"
      display="flex"
      justifyContent="center"
      alignItems="center"
    >
      <Box position="relative">
        <Box
          maxWidth="100%"
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <Image
            src={src}
            alt={altText}
            maxHeight={isSmallerThanPhone ? 'auto' : '200px'}
            maxWidth="100%"
            onLoad={() => {
              setIsImageLoaded(true);
            }}
            onDoubleClick={toggleFullscreen}
          />
        </Box>
        {!fullscreen && isImagedLoaded && (
          <Box
            position="absolute"
            right="8px"
            bottom="8px"
            borderRadius="4px"
            background={colors.white}
            onClick={toggleFullscreen}
          >
            <IconButton
              iconRef={fullscreenButtonRef}
              buttonType="button"
              iconName="layout-white-space"
              a11y_buttonActionMessage={formatMessage(messages.expandImage)}
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
