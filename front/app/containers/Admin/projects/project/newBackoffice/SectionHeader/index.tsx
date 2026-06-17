import React from 'react';

import {
  Box,
  Icon,
  IconNames,
  Text,
  colors,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

// Mirrors the "Project page" nav row (ItemRow) so the section headings read at
// the same level: same padding, radius and hover, with a leading icon and the
// chevron aligned.
const HeaderButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin: 0 0 4px 0;
  padding: 8px 10px;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;

  &:hover {
    background: ${colors.grey100};
  }
`;

interface Props {
  title: string;
  icon: IconNames;
  expanded: boolean;
  onToggle: () => void;
}

/**
 * Collapsible section header used by the redesigned project sidebar (Timeline
 * phases, Activities): an icon + caption with a chevron that toggles the
 * section, styled to match the "Project page" nav item.
 */
const SectionHeader = ({ title, icon, expanded, onToggle }: Props) => (
  <HeaderButton type="button" aria-expanded={expanded} onClick={onToggle}>
    <Box display="flex" alignItems="center" gap="10px" minWidth="0">
      <Icon name={icon} width="20px" height="20px" fill={colors.coolGrey600} />
      <Text m="0" fontSize="s" fontWeight="normal" color="coolGrey700">
        {title}
      </Text>
    </Box>
    <Icon
      name={expanded ? 'chevron-down' : 'chevron-right'}
      width="16px"
      height="16px"
      fill={colors.coolGrey600}
    />
  </HeaderButton>
);

export default SectionHeader;
