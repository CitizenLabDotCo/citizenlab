import React from 'react';

import { colors, fontSizes, Icon } from '@citizenlab/cl2-component-library';
import { lighten } from 'polished';
import styled from 'styled-components';

const PlaceholderContainer = styled.div<{ $color: string }>`
  display: flex;
  align-items: center;
  color: ${({ $color }) => $color};
  border: 1px solid ${({ $color }) => lighten(0.4, $color)};
  border-radius: ${(props) => props.theme.borderRadius};
  font-size: ${fontSizes.base}px;
  line-height: 24px;
  padding: 10px 20px;
  margin-bottom: 10px;
`;

const PlaceholderIcon = styled(Icon)<{ $color: string }>`
  fill: ${({ $color }) => $color};
  margin-right: 15px;
  flex-shrink: 0;
`;

type FilePlaceholderProps = {
  variant?: 'error';
  children: React.ReactNode;
};

const FilePlaceholder = ({ variant, children }: FilePlaceholderProps) => {
  const color = variant === 'error' ? colors.error : colors.textSecondary;
  return (
    <PlaceholderContainer $color={color}>
      <PlaceholderIcon name="paperclip" $color={color} />
      {children}
    </PlaceholderContainer>
  );
};

export default FilePlaceholder;
