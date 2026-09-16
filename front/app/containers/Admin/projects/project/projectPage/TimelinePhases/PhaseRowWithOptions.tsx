import React, { ReactNode } from 'react';

import styled from 'styled-components';

// The options button is a sibling of the row's link, since a button can't sit
// inside one. It only shows while the row is hovered, focused or its menu open.
const Container = styled.div`
  position: relative;

  .phase-options {
    position: absolute;
    top: 6px;
    right: 6px;
    opacity: 0;
    transition: opacity 80ms ease-out;
  }

  &:hover .phase-options,
  &:focus-within .phase-options,
  .phase-options:has([aria-expanded='true']) {
    opacity: 1;
  }
`;

interface Props {
  options: ReactNode;
  children: ReactNode;
}

const PhaseRowWithOptions = ({ options, children }: Props) => (
  <Container>
    {children}
    <div className="phase-options">{options}</div>
  </Container>
);

export default PhaseRowWithOptions;
