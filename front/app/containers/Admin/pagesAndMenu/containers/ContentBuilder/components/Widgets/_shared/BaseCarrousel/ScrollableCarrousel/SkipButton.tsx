import React from 'react';

import { colors } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

const StyledButton = styled.button`
  position: absolute;
  left: 0;
  top: 0;
  opacity: 0;
  z-index: 2;
  padding: 8px;
  background: ${colors.white};

  &:focus {
    top: 40px;
    opacity: 1;
  }
`;

interface Props {
  onSkip: () => void;
}

const SkipButton = ({ onSkip }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <StyledButton
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.code === 'Enter' || e.code === 'Escape') {
          onSkip();
        }
      }}
    >
      {formatMessage(messages.skipCarrousel)}
    </StyledButton>
  );
};

export default SkipButton;
