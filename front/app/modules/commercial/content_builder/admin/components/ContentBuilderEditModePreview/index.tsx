import React, { memo, useState } from 'react';

// components
import { Box, Icon, Button } from '@citizenlab/cl2-component-library';

// styles
import { stylingConsts } from 'utils/styleUtils';

// hooks
import useLocale from 'hooks/useLocale';

type ContentBuilderMobileViewProps = {
  projectId: string;
};

const ContentBuilderEditModePreview = React.forwardRef<
  HTMLIFrameElement,
  ContentBuilderMobileViewProps
>(({ projectId }, ref) => {
  const locale = useLocale();
  const [isMobile, setIsMobile] = useState(true);
  const whiteIfMobile = isMobile ? '#FFFFFF' : '#044D6C';
  const whiteIfDesktop = isMobile ? '#044D6C' : '#FFFFFF';
  const buttonProps = {
    height: '42px',
    width: '90px',
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
          mb="15px"
          border="1px solid #AAAAAA"
          borderRadius="4px"
        >
          <Button
            bgColor={whiteIfDesktop}
            onClick={() => {
              !isMobile && setIsMobile(true);
            }}
            {...buttonProps}
          >
            <Icon
              name="tablet"
              width="17px"
              height="22px"
              fill={whiteIfMobile}
            />
          </Button>
          <Button
            bgColor={whiteIfMobile}
            onClick={() => {
              isMobile && setIsMobile(false);
            }}
            {...buttonProps}
          >
            <Icon name="desktop" width="22px" fill={whiteIfDesktop} />
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
          />
        </Box>
      </Box>
    </Box>
  );
});

export default memo(ContentBuilderEditModePreview);
