import React from 'react';
import styled from 'styled-components';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

const Container = styled.span<{ color?: string; emphasize?: boolean }>`
  color: ${({ color, theme }) => color || theme.colorText};
  font-weight: ${({ emphasize }) => (emphasize ? 500 : 'normal')};
  text-decoration: none;
  hyphens: auto;
  font-style: italic;
`;

interface Props {
  className?: string;
}

const UnknownUser = ({ className }: Props) => {
  return (
    // TODO: check if color prop is needed here
    <Container className={`${className} e2e-username`}>
      <FormattedMessage {...messages.deletedUser} />
    </Container>
  );
};

export default UnknownUser;
