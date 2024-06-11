import React from 'react';

// styling
import styled from 'styled-components';

import { colors } from '../../utils/styleUtils';

export interface Props {
  children: React.ReactNode;
}

const StyledTFoot = styled.tfoot`
  tr:first-child > td {
    border-top: 1px solid ${colors.grey200};
  }
`;

const Tfoot = ({ children }: Props) => <StyledTFoot>{children}</StyledTFoot>;

export default Tfoot;
