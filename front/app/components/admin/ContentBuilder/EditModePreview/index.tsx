import React, { memo, useState } from 'react';

import { Box, stylingConsts } from '@citizenlab/cl2-component-library';

import { devicePreviewSizes } from './dimensions';
import DesktopButton from './ViewButtons/DesktopButton';
import MobileButton from './ViewButtons/MobileButton';

type Props = {
  iframeSrc: string;
};

const ContentBuilderEditModePreview = React.forwardRef<
  HTMLIFrameElement,
  Props
>(({ iframeSrc }, ref) => {
  const [isMobile, setIsMobile] = useState(true);

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
        {/* Platform Container */}
        <Box
          height={devicePreviewSizes.frameHeight}
          border="solid black"
          borderWidth="40px 20px 20px 20px"
          zIndex="1"
          mb="12px"
          width={
            isMobile
              ? devicePreviewSizes.mobile.frameWidth
              : devicePreviewSizes.desktop.frameWidth
          }
          borderRadius="20px"
        >
          {/* Iframe */}
          <Box
            as="iframe"
            ref={ref}
            src={iframeSrc}
            height={devicePreviewSizes.iframeHeight}
            width={
              isMobile
                ? devicePreviewSizes.mobile.iframeWidth
                : devicePreviewSizes.desktop.iframeWidth
            }
            border="none"
            borderRadius="3px"
            data-cy={
              isMobile ? 'mobile-preview-iframe' : 'desktop-preview-iframe'
            }
          />
        </Box>
      </Box>
    </Box>
  );
});

export default memo(ContentBuilderEditModePreview);
