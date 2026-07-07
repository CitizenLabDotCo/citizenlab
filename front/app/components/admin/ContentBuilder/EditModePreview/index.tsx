import React, { memo, useEffect, useRef, useState } from 'react';

import { Box, stylingConsts } from '@citizenlab/cl2-component-library';

import { devicePreviewSizes } from './dimensions';
import DesktopButton from './ViewButtons/DesktopButton';
import MobileButton from './ViewButtons/MobileButton';

// The device frame scales to the available space so nothing is cut off on
// small screens, and grows on large ones — but only up to a point, so the
// preview never looks comically large.
const MAX_SCALE = 1.25;
const BOTTOM_MARGIN = 12;
const HORIZONTAL_MARGIN = 48;

type Props = {
  iframeSrc: string;
};

const ContentBuilderEditModePreview = React.forwardRef<
  HTMLIFrameElement,
  Props
>(({ iframeSrc }, ref) => {
  const [isMobile, setIsMobile] = useState(true);
  const [scale, setScale] = useState(1);
  const frameAreaRef = useRef<HTMLDivElement | null>(null);

  const frameWidth = isMobile
    ? devicePreviewSizes.mobile.frameWidth
    : devicePreviewSizes.desktop.frameWidth;
  const { frameHeight } = devicePreviewSizes;

  useEffect(() => {
    const frameArea = frameAreaRef.current;
    if (!frameArea) return;

    const computeScale = () => {
      // Sized against the window, not the container: the flex ancestors
      // shrink to the (scaled) frame, so the container's width would feed the
      // scale back into itself.
      const { top } = frameArea.getBoundingClientRect();
      const availableWidth = window.innerWidth - HORIZONTAL_MARGIN;
      const availableHeight = window.innerHeight - top - BOTTOM_MARGIN;
      const fit = Math.min(
        availableWidth / frameWidth,
        availableHeight / frameHeight
      );
      setScale(Math.max(0, Math.min(MAX_SCALE, fit)));
    };

    computeScale();
    const observer = new ResizeObserver(computeScale);
    observer.observe(frameArea);
    window.addEventListener('resize', computeScale);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', computeScale);
    };
  }, [frameWidth, frameHeight]);

  return (
    <Box
      mt={`${stylingConsts.menuHeight + 20}px`}
      minHeight={`calc(100vh - ${2 * stylingConsts.menuHeight + 20}px)`}
      justifyContent="center"
    >
      <Box display="flex" flexDirection="column" alignItems="center">
        <Box display="flex" mb="16px">
          <MobileButton
            active={isMobile}
            onClick={() => {
              setIsMobile(true);
            }}
          />
          <DesktopButton
            active={!isMobile}
            onClick={() => {
              setIsMobile(false);
            }}
          />
        </Box>
        <Box
          ref={frameAreaRef}
          width="100%"
          display="flex"
          justifyContent="center"
        >
          {/* Sized to the scaled frame, so the layout reserves the right space
              while the frame itself keeps its logical size and is transformed. */}
          <Box
            width={`${frameWidth * scale}px`}
            height={`${frameHeight * scale}px`}
          >
            {/* Platform Container */}
            <Box
              height={`${frameHeight}px`}
              border="solid black"
              borderWidth="40px 20px 20px 20px"
              zIndex="1"
              mb="12px"
              width={`${frameWidth}px`}
              borderRadius="20px"
              style={{
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
              }}
            >
              {/* Iframe */}
              <Box
                as="iframe"
                ref={ref}
                src={iframeSrc}
                height={`${devicePreviewSizes.iframeHeight}px`}
                width={`${
                  isMobile
                    ? devicePreviewSizes.mobile.iframeWidth
                    : devicePreviewSizes.desktop.iframeWidth
                }px`}
                border="none"
                borderRadius="3px"
                data-cy={
                  isMobile ? 'mobile-preview-iframe' : 'desktop-preview-iframe'
                }
              />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
});

export default memo(ContentBuilderEditModePreview);
