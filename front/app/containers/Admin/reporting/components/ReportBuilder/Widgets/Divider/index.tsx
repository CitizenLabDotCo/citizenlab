import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';
import { useTheme } from 'styled-components';

import messages from './messages';
import Settings from './Settings';

export type DividerVariant = 'section' | 'hairline' | 'dots';

export interface Props {
  variant?: DividerVariant;
}

// A rule above a heading is what makes a run of sections read as a document
// rather than a scroll. "section" is the heavy one that opens a section;
// the other two are quieter separators inside one.
const Divider = ({ variant = 'section' }: Props) => {
  const theme = useTheme();

  if (variant === 'section') {
    return (
      <Box
        className="e2e-report-divider"
        w="100%"
        h="3px"
        background={theme.colors.tenantPrimary}
        my="20px"
      />
    );
  }

  return (
    <Box
      className="e2e-report-divider"
      w="100%"
      my="16px"
      borderTop={`1px ${variant === 'dots' ? 'dotted' : 'solid'} ${
        colors.divider
      }`}
    />
  );
};

Divider.craft = {
  props: {
    variant: 'section',
  },
  related: {
    settings: Settings,
  },
  custom: {
    title: messages.divider,
  },
};

export const dividerTitle = messages.divider;

export default Divider;
