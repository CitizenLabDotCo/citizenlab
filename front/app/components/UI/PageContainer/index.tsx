import React, { ReactNode } from 'react';
import {
  Box,
  useBreakpoint,
  BoxProps,
} from '@citizenlab/cl2-component-library';
import { useTheme } from 'styled-components';
import { colors } from 'utils/styleUtils';

interface Props extends BoxProps {
  children: ReactNode;
}

const PageContainer = ({ children, background, ...otherProps }: Props) => {
  const tablet = useBreakpoint('tablet');
  const theme: any = useTheme();

  return (
    <Box
      background={background || colors.background}
      width="100%"
      position="relative"
      minHeight={
        tablet
          ? `calc(100vh - ${theme.mobileMenuHeight}px - ${theme.mobileTopBarHeight}px)`
          : `calc(100vh - ${theme.menuHeight}px - ${theme.footerHeight}px)`
      }
      {...otherProps}
    >
      {children}
    </Box>
  );
};

export default PageContainer;
