import React from 'react';

// styles
import { darken } from 'polished';
import { colors } from 'utils/styleUtils';
import styled from 'styled-components';

const Container = styled.span<{
  color?: string;
  emphasize?: boolean;
  underline?: boolean;
}>`
  color: ${({ color, theme }) => color || theme.colorText};
  font-weight: ${({ emphasize }) => (emphasize ? 500 : 'normal')};
  text-decoration: ${({ underline }) => (underline ? 'underline' : 'none')};
  hyphens: auto;

  &.isLinkToProfile {
    &:hover {
      text-decoration: underline;
      color: ${({ color, theme }) => darken(0.15, color || theme.colorText)};
    }
  }

  &.canModerate {
    color: ${colors.clRedError};

    &:hover {
      color: ${darken(0.15, colors.clRedError)};
    }
  }

  // this one has to stay at the bottom to
  // overwrite the styles when there's no user
  &.isUnknownUser {
    font-style: italic;
    text-decoration: none;

    &:hover {
      text-decoration: none;
      color: ${({ color, theme }) => color || theme.colorText};
    }
  }
`;

interface Props {
  name: string;
  className?: string;
  emphasize?: boolean;
  underline?: boolean;
  isLinkToProfile?: boolean;
  color?: string;
  canModerate?: boolean;
  isUnknownUser?: boolean;
}

const Name = ({
  className,
  name,
  emphasize,
  underline,
  isLinkToProfile,
  color,
  canModerate,
  isUnknownUser,
}: Props) => {
  return (
    <Container
      emphasize={emphasize}
      underline={underline}
      className={`
        ${className || ''}
        ${canModerate ? 'canModerate' : ''}
        ${isUnknownUser ? 'isUnknownUser' : ''}
        ${isLinkToProfile ? 'isLinkToProfile' : ''}
        e2e-username
      `}
      color={color}
    >
      {name}
    </Container>
  );
};

export default Name;
