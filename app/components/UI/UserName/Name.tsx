import React from 'react';

// styles
import { darken } from 'polished';
import { colors } from 'utils/styleUtils';
import styled from 'styled-components';

const Container = styled.span<{ color?: string; emphasize?: boolean }>`
  color: ${({ color, theme }) => color || theme.colorText};
  font-weight: ${({ emphasize }) => (emphasize ? 500 : 'normal')};
  text-decoration: none;
  hyphens: auto;

  &.canModerate {
    color: ${colors.clRedError};

    &:hover {
      color: ${darken(0.15, colors.clRedError)};
    }
  }

  &.isUnknownUser {
    font-style: italic;
  }
`;

interface Props {
  name: string;
  className?: string;
  emphasize?: boolean;
  color?: string;
  canModerate?: boolean;
  isUnknownUser?: boolean;
}

const Name = ({
  className,
  name,
  emphasize,
  color,
  canModerate,
  isUnknownUser,
}: Props) => {
  return (
    <Container
      emphasize={emphasize}
      className={`
        ${className || ''}
        ${canModerate ? 'canModerate' : ''}
        ${isUnknownUser ? 'isUnknownUser' : ''}
        e2e-username
      `}
      color={color}
    >
      {name}
    </Container>
  );
};

export default Name;
