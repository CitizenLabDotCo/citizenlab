import React, { ReactNode, useState } from 'react';

import { Icon, colors, fontSizes } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

const Wrapper = styled.li`
  list-style: none;
`;

const DropdownButton = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  padding: 0;
  margin: 0;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: ${fontSizes.base}px;
  color: ${colors.textPrimary};
  text-align: left;
  font-weight: 600;
`;

const ChevronIcon = styled(Icon)<{ $expanded: boolean }>`
  flex: 0 0 auto;
  fill: ${colors.textPrimary};
  transition: transform 200ms ease-out;
  transform: rotate(${({ $expanded }) => ($expanded ? '90deg' : '0deg')});
`;

const ChildItems = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;

  > * {
    margin-top: 24px;
  }
`;

interface Props {
  title: string;
  // Rendered (indented) when the dropdown is expanded.
  children: ReactNode;
}

// Mobile equivalent of a navbar dropdown item: a tappable row that
// expands in place to reveal its children, with a chevron that rotates to
// indicate the open/closed state.
const FullMobileNavMenuDropdown = ({ title, children }: Props) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <Wrapper>
      <DropdownButton
        type="button"
        aria-expanded={expanded}
        onClick={() => setExpanded((prev) => !prev)}
      >
        {title}
        <ChevronIcon
          name="chevron-right"
          width="20px"
          height="20px"
          $expanded={expanded}
        />
      </DropdownButton>
      {expanded && <ChildItems>{children}</ChildItems>}
    </Wrapper>
  );
};

export default FullMobileNavMenuDropdown;
