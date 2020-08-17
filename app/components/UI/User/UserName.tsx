import React from 'react';

// styles
import { darken } from 'polished';
import { colors } from 'utils/styleUtils';
import styled from 'styled-components';

const Name = styled.span<{ color?: string; emphasize?: boolean }>`
  color: ${({ color, theme }) => color || theme.colorText};
  font-weight: ${({ emphasize }) => (emphasize ? 500 : 'normal')};
  text-decoration: none;
  hyphens: auto;

  &.linkToProfile {
    transition: all 80ms ease-out;

    &:hover {
      cursor: pointer;
      color: ${({ color, theme }) => darken(0.15, color || theme.colorText)};
      text-decoration: underline;
    }

    &.canModerate {
      color: ${colors.clRedError};

      &:hover {
        color: ${darken(0.15, colors.clRedError)};
      }
    }
  }

  &.deleted-user {
    font-style: italic;
  }
`;

interface Props {
  className?: string;
  firstName: string;
  lastName: string;
  hideLastName?: boolean;
  emphasize?: boolean;
  color?: string;
  canModerate?: boolean;
}

const UserName = ({
  className,
  firstName,
  lastName,
  hideLastName,
  emphasize,
  color,
  canModerate,
}: Props) => {
  return (
    <Name
      emphasize={emphasize}
      className={`
        ${className || ''}
        ${canModerate ? 'canModerate' : ''}
        e2e-username
      `}
      color={color}
    >
      {`${firstName} ${hideLastName ? '' : lastName}`}
    </Name>
  );
};

export default UserName;
