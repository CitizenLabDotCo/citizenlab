import React from 'react';

import {
  Box,
  CollapsibleContainer,
  colors,
  Title,
} from '@citizenlab/cl2-component-library';

interface Props {
  title: string;
  children: JSX.Element;
  className?: string;
}

const InputFilterCollapsible = ({ title, children, className }: Props) => {
  return (
    <Box
      className={className}
      background={colors.white}
      borderRadius="3px"
      mb="20px"
      p="12px"
    >
      <CollapsibleContainer
        title={
          <Title m="0px" variant="h6" fontWeight="bold">
            {title.toUpperCase()}
          </Title>
        }
        isOpenByDefault={true}
      >
        <Box mt="12px" display="block">
          {children}
        </Box>
      </CollapsibleContainer>
    </Box>
  );
};

export default InputFilterCollapsible;
