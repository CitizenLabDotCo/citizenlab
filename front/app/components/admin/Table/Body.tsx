import React from 'react';

// styling
import styled from 'styled-components';
import { SEMANTIC_UI_BORDER_INNER_COLOR } from './constants';

interface Props {
  children: React.ReactNode;
  horizontalBorders?: boolean;
}

const StyledTBody = styled.tbody`
  tr > td {
    border-bottom: 1px solid ${SEMANTIC_UI_BORDER_INNER_COLOR};
  }

  tr:last-child {
    td {
      border-bottom: none;
    }
  }
`;

const Body = ({ children, horizontalBorders }: Props) =>
  horizontalBorders ? (
    <StyledTBody>{children}</StyledTBody>
  ) : (
    <tbody>{children}</tbody>
  );

export default Body;
