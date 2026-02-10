import React from 'react';

import { ClickOutside } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

const StyledClickOutside = styled(ClickOutside)<{ width: string }>`
  div.tippy-box {
    max-width: ${({ width }) => width} !important;
    padding: 8px;
  }
`;

interface Props {
  width: string;
  onClickOutside: () => void;
  children: React.ReactNode;
}

const ClickOutsideContainer = ({ width, onClickOutside, children }: Props) => {
  return (
    <StyledClickOutside width={width} onClickOutside={onClickOutside}>
      {children}
    </StyledClickOutside>
  );
};

export default ClickOutsideContainer;
