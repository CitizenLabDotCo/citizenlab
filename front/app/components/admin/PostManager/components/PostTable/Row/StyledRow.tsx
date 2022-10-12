import React from 'react';
import styled from 'styled-components';

// components
import { Tr } from 'components/admin/Table';

import { Props as RowProps } from 'components/admin/Table/Tr';

const StyledRow = styled(Tr)<{ undraggable: boolean }>`
  height: 5.7rem !important;
  cursor: ${({ undraggable }) => (undraggable ? 'pointer' : 'move')};
`;

interface Props extends RowProps {
  undraggable: boolean;
}

export default React.forwardRef(
  (props: Props, ref: React.RefObject<HTMLTableRowElement>) => (
    <StyledRow {...props} ref={ref} />
  )
);
