import React, { useState } from 'react';

import {
  Box,
  Icon,
  Text,
  colors,
  fontSizes,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

// The settings inside a group are built for a full-width page, where their
// titles carry the section. In the panel the group row carries it instead, so
// they step down to label scale.
const GroupContent = styled(Box)`
  h3,
  h4,
  h5 {
    font-size: ${fontSizes.s}px;
    color: ${colors.textPrimary};
  }
`;

interface Props {
  label: string;
  /** Shown on the row when collapsed, e.g. a count of what is configured. */
  summary?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

/**
 * One concern in the phase settings panel. The panel is too narrow to show
 * every setting at once, so each group opens on demand and the rows in between
 * stay scannable.
 */
const PanelGroup = ({
  label,
  summary,
  defaultOpen = false,
  children,
}: Props) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Box borderTop={`1px solid ${colors.grey200}`}>
      <Box
        as="button"
        type="button"
        w="100%"
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        gap="8px"
        py="14px"
        background="transparent"
        border="none"
        style={{ cursor: 'pointer' }}
        aria-expanded={open}
        onClick={() => setOpen((open) => !open)}
      >
        <Text fontSize="s" fontWeight="semi-bold" color="textPrimary" m="0">
          {label}
        </Text>
        <Box display="flex" alignItems="center" gap="8px">
          {summary && (
            <Text fontSize="s" color="textSecondary" m="0">
              {summary}
            </Text>
          )}
          <Icon
            name={open ? 'chevron-down' : 'chevron-right'}
            width="16px"
            height="16px"
            fill={colors.coolGrey500}
          />
        </Box>
      </Box>

      {open && <GroupContent pb="16px">{children}</GroupContent>}
    </Box>
  );
};

export default PanelGroup;
