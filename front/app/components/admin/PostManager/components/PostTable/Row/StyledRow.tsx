import React from 'react';
import styled from 'styled-components';

// components
import { Tr, TrProps } from '@citizenlab/cl2-component-library';

const StyledRow = styled(Tr)<{ undraggable: boolean }>`
  height: 5.7rem;
  cursor: ${({ undraggable }) => (undraggable ? 'pointer' : 'move')};
`;

interface Props extends TrProps {
  undraggable: boolean;
}

export default React.forwardRef(
  (props: Props, ref: React.RefObject<HTMLTableRowElement>) => (
    <StyledRow {...props} innerRef={ref} />
  )
);
