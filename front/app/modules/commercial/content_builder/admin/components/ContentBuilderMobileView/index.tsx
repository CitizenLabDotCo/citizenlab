import React, { memo } from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';

// styles
import { stylingConsts } from 'utils/styleUtils';

// hooks
import useLocale from 'hooks/useLocale';
import useProject from 'hooks/useProject';

// intl

type ContentBuilderMobileViewProps = {
  projectId: string;
};

const ContentBuilderMobileView = React.forwardRef<
  HTMLIFrameElement,
  ContentBuilderMobileViewProps
>(({ projectId }, ref) => {
  const locale = useLocale();
  const project = useProject({ projectId });

  return (
    <Box
      mt={`${stylingConsts.menuHeight + 20}px`}
      minHeight={`calc(100vh - ${2 * stylingConsts.menuHeight + 20}px)`}
      justifyContent="center"
    >
      <Box display="flex" flexDirection="column" alignItems="center">
        {/* Phone Container */}
        <Box
          height="620px"
          width="360px"
          border="solid black"
          borderWidth="40px 20px 20px 20px"
          borderRadius="30px"
          zIndex="1"
          mb="12px"
        >
          {/* Iframe */}
          <Box
            as="iframe"
            ref={ref}
            src={`/${locale}/projects/${project?.attributes.slug}`}
            height="560px"
            width="320px"
            border="none"
            borderRadius="3px"
          />
        </Box>
      </Box>
    </Box>
  );
});

export default memo(ContentBuilderMobileView);
