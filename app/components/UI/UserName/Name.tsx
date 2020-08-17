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
`;

interface Props {
  className?: string;
  firstName: string;
  // See users.ts
  // lastName can be null when user exists since CL1
  // or when signing up with Google
  lastName: string | null;
  hideLastName?: boolean;
  emphasize?: boolean;
  color?: string;
  canModerate?: boolean;
}

const Name = ({
  className,
  firstName,
  lastName,
  hideLastName,
  emphasize,
  color,
  canModerate,
}: Props) => {
  return (
    <Container
      emphasize={emphasize}
      className={`
        ${className || ''}
        ${canModerate ? 'canModerate' : ''}
        e2e-username
      `}
      color={color}
    >
      {`${firstName} ${!hideLastName && lastName ? lastName : ''}`}
    </Container>
  );
};

export default Name;
