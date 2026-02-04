import React, { ReactNode } from 'react';

import {
  Box,
  colors,
  fontSizes,
  Icon,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

const PlaceholderContainer = styled(Box)<{ color: string }>`
  display: flex;
  align-items: center;
  color: ${({ color }) => color};
  border: 1px solid ${(props) => props.theme.colors.borderLight};
  border-radius: ${(props) => props.theme.borderRadius};
  font-size: ${fontSizes.base}px;
  padding: 10px 20px;
  margin-bottom: 10px;
`;

const PlaceholderIcon = styled(Icon)<{ color: string }>`
  fill: ${({ color }) => color};
  margin-right: 15px;
  flex-shrink: 0;
`;

type FilePlaceholderProps = {
  variant?: 'error';
  children: ReactNode;
};

const FilePlaceholder = ({ variant, children }: FilePlaceholderProps) => {
  const color = variant === 'error' ? colors.error : colors.textSecondary;
  const iconName = variant === 'error' ? 'paperclip' : 'file-add';
  return (
    <PlaceholderContainer color={color}>
      <PlaceholderIcon name={iconName} color={color} />
      {children}
    </PlaceholderContainer>
  );
};

export default FilePlaceholder;
