import React from 'react';

import { CollapsibleContainer } from '@citizenlab/cl2-component-library';
import { useTheme } from 'styled-components';

interface Props {
  title: string;
  children: JSX.Element;
  className?: string;
}

const InputFilterCollapsible = ({ title, children, className }: Props) => {
  const theme = useTheme();

  return (
    <CollapsibleContainer
      titleAs="h2"
      titleVariant="h6"
      titleFontWeight="bold"
      title={title.toUpperCase()}
      titlePadding="12px"
      background="white"
      borderRadius={theme.borderRadius}
      isOpenByDefault={true}
      className={className}
    >
      {children}
    </CollapsibleContainer>
  );
};

export default InputFilterCollapsible;
