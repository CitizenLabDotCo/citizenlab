import React from 'react';

import {
  Box,
  useBreakpoint,
  stylingConsts,
} from '@citizenlab/cl2-component-library';

interface Props {
  id?: string;
  layoutType: 'inline' | 'fullpage';
  isSurvey: boolean;
  children: React.ReactNode;
}

const Wrapper = ({ id, layoutType, isSurvey, children }: Props) => {
  const isSmallerThanPhone = useBreakpoint('phone');

  return (
    <Box
      as="form"
      minHeight={
        isSmallerThanPhone && layoutType === 'fullpage' && !isSurvey
          ? `calc(100vh - ${stylingConsts.menuHeight}px)`
          : '100%'
      }
      height={
        !isSmallerThanPhone && layoutType === 'fullpage' && !isSurvey
          ? '100vh'
          : '100%'
      }
      maxHeight={
        layoutType === 'inline' ||
        (layoutType === 'fullpage' && (isSmallerThanPhone || isSurvey))
          ? 'auto'
          : `calc(100vh - ${stylingConsts.menuHeight}px)`
      }
      display="flex"
      flexDirection="column"
      id={id}
    >
      {children}
    </Box>
  );
};

export default Wrapper;
