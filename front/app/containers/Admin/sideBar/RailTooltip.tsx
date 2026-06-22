import React from 'react';

import { Tooltip } from '@citizenlab/cl2-component-library';

interface Props {
  label: string;
  // Pass true when the rail is expanded — the label is already visible.
  disabled: boolean;
  children: React.ReactElement;
}

/**
 * Hover/focus tooltip surfacing a nav item's name when the admin rail is
 * collapsed (icon-only). `appendTo` body so it escapes the sidebar's stacking
 * context (z-index 10) and isn't painted under the project header (z-index 1001).
 */
const RailTooltip = ({ label, disabled, children }: Props) => (
  <Tooltip
    content={label}
    placement="right"
    theme="dark"
    disabled={disabled}
    appendTo={() => document.body}
  >
    {children}
  </Tooltip>
);

export default RailTooltip;
