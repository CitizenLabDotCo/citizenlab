import React, { ReactNode } from 'react';

import {
  Box,
  colors,
  fontSizes,
  Icon,
  IconNames,
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

type WidgetPlaceholderProps = {
  iconName: IconNames;
  variant?: 'error';
  children: ReactNode;
};

// Builder stand-in for a widget with nothing to render: nothing selected, or a selection that
// no longer resolves (`error`). Never shown in the front office.
const WidgetPlaceholder = ({
  iconName,
  variant,
  children,
}: WidgetPlaceholderProps) => {
  const color = variant === 'error' ? colors.error : colors.textSecondary;

  return (
    <PlaceholderContainer color={color}>
      <PlaceholderIcon name={iconName} color={color} />
      {children}
    </PlaceholderContainer>
  );
};

export default WidgetPlaceholder;
