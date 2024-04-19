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

  const heightStyles = {
    inline: {
      minHeight: '100%',
      height: '100%',
      maxHeight: 'auto',
    },
    fullpage: isSurvey
      ? {
          minHeight: '100%',
          height: '100%',
          maxHeight: 'auto',
        }
      : isSmallerThanPhone
      ? {
          minHeight: `calc(100vh - ${stylingConsts.menuHeight}px)`,
          height: '100%',
          maxHeight: 'auto',
        }
      : {
          minHeight: '100%',
          height: '100vh',
          maxHeight: `calc(100vh - ${stylingConsts.menuHeight}px)`,
        },
  }[layoutType];

  return (
    <Box
      as="form"
      {...heightStyles}
      display="flex"
      flexDirection="column"
      id={id}
    >
      {children}
    </Box>
  );
};

export default Wrapper;
