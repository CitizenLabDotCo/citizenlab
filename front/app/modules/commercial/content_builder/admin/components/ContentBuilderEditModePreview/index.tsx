import React, { memo, useState } from 'react';

// components
import { Box, Icon, Button } from '@citizenlab/cl2-component-library';

// styles
import { stylingConsts, colors } from 'utils/styleUtils';

// hooks
import useLocale from 'hooks/useLocale';

type ContentBuilderPreviewProps = {
  projectId: string;
};

const ContentBuilderEditModePreview = React.forwardRef<
  HTMLIFrameElement,
  ContentBuilderPreviewProps
>(({ projectId }, ref) => {
  const locale = useLocale();
  const [isMobile, setIsMobile] = useState(true);
  const colorIfDesktopView = isMobile
    ? colors.adminContentBackground
    : colors.adminTextColor;
  const colorIfMobileView = isMobile
    ? colors.adminTextColor
    : colors.adminContentBackground;
  const buttonProps = {
    height: '40px',
    width: '92px',
  };

  return (
    <Box
      mt={`${stylingConsts.menuHeight + 20}px`}
      minHeight={`calc(100vh - ${2 * stylingConsts.menuHeight + 20}px)`}
      justifyContent="center"
    >
      <Box display="flex" flexDirection="column" alignItems="center">
        <Box
          display="flex"
          mb="16px"
          border={`1px solid ${colors.adminTextColor}`}
          borderRadius="4px"
        >
          <Button
            bgColor={colorIfMobileView}
            onClick={() => {
              !isMobile && setIsMobile(true);
            }}
            id="e2e-mobile-preview"
            {...buttonProps}
          >
            <Icon
              name="tablet"
              width="16px"
              height="20px"
              fill={colorIfDesktopView}
            />
          </Button>
          <Button
            bgColor={colorIfDesktopView}
            onClick={() => {
              isMobile && setIsMobile(false);
            }}
            id="e2e-desktop-preview"
            {...buttonProps}
          >
            <Icon name="desktop" width="20px" fill={colorIfMobileView} />
          </Button>
        </Box>
        {/* Platform Container */}
        <Box
          height="620px"
          border="solid black"
          borderWidth="40px 20px 20px 20px"
          zIndex="1"
          mb="12px"
          width={isMobile ? '360px' : '1140px'}
          borderRadius="33px"
        >
          {/* Iframe */}
          <Box
            as="iframe"
            ref={ref}
            src={`/${locale}/admin/content-builder/projects/${projectId}/preview`}
            height="560px"
            width={isMobile ? '320px' : '1100px'}
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
