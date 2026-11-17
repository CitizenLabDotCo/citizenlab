import React from 'react';

import {
  Box,
  CollapsibleContainer,
  colors,
} from '@citizenlab/cl2-component-library';
import { useTheme } from 'styled-components';

interface Props {
  title: string;
  children: JSX.Element | JSX.Element[];
  className?: string;
}

const InputFilterCollapsible = ({ title, children, className }: Props) => {
  const theme = useTheme();

  return (
    <CollapsibleContainer
      titleAs="h3"
      titleVariant="h6"
      title={title.toUpperCase()}
      titlePadding="12px"
      background="white"
      borderRadius={theme.borderRadius}
      isOpenByDefault={true}
      className={className}
    >
      <Box
        bgColor={colors.white}
        p="16px"
        pt="0"
        borderRadius={theme.borderRadius}
      >
        {children}
      </Box>
    </CollapsibleContainer>
  );
};

export default InputFilterCollapsible;
