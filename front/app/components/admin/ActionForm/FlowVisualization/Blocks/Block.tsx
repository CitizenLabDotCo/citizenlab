import React from 'react';

import {
  Box,
  Icon,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

interface Props {
  number: number;
  text: string;
}

export const Block = ({ number, text }: Props) => {
  return (
    <Box
      borderRadius={stylingConsts.borderRadius}
      border={`1px solid ${colors.blue700}`}
      bgColor={colors.teal50}
      p="16px"
      w="240px"
    >
      <Box mb="8px">{`${number}.`}</Box>
      <Box>{text}</Box>
    </Box>
  );
};

interface SSOBlockProps {
  number: number;
  text: React.ReactNode;
  onClick: () => void;
}

const StyledBox = styled(Box)`
  &:hover {
    background-color: ${colors.teal100};
  }
`;

export const SSOBlock = ({ number, text, onClick }: SSOBlockProps) => {
  return (
    <StyledBox
      borderRadius={stylingConsts.borderRadius}
      border={`1px solid ${colors.blue700}`}
      bgColor={colors.teal50}
      p="16px"
      w="240px"
      style={{
        cursor: 'pointer',
      }}
      onClick={onClick}
    >
      <Box
        display="flex"
        w="100%"
        justifyContent="space-between"
        mb="8px"
        alignItems="flex-start"
      >
        <Box>{`${number}.`}</Box>
        <Icon
          name="settings"
          fill={colors.blue500}
          width="16px"
          height="16px"
        />
      </Box>
      <Box>{text}</Box>
    </StyledBox>
  );
};
