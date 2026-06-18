import React from 'react';

import { Tooltip } from '@citizenlab/cl2-component-library';

interface Props {
  label: string;
  // Only shown when the rail is collapsed (icon-only) — the label is otherwise
  // already visible next to the icon.
  disabled: boolean;
  children: React.ReactElement;
}

/**
 * Hover/focus tooltip for the collapsed (icon-only) admin rail, surfacing each
 * item's name (matching the prototype).
 *
 * `appendTo` body so the tooltip escapes the sidebar's own stacking context
 * (z-index 10) — without it the topmost item's tooltip is painted under the
 * project header bar (z-index 1001).
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
