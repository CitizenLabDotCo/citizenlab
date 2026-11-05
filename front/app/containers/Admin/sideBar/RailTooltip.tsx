import React from 'react';

import { Tooltip } from '@citizenlab/cl2-component-library';

interface Props {
  label: string;
  disabled: boolean;
  children: React.ReactElement;
}

/**
 * Hover/focus tooltip surfacing a nav item's name when the admin rail is
 * collapsed (icon-only). `appendTo` body so it escapes the sidebar's stacking
 * context (z-index 10) and isn't painted under the project header (z-index 1001).
 *
 * Expanded: force the wrapper to full width so `width: 100%` rows fill the rail
 * and stay left-aligned (Tooltip's `fit-content` default would shrink and center
 * them). Collapsed: keep `fit-content` so the 56px icon rows stay centered.
 */
const RailTooltip = ({ label, disabled, children }: Props) => (
  <Tooltip
    content={label}
    placement="right"
    theme="dark"
    disabled={disabled}
    width={disabled ? '100%' : undefined}
    appendTo={() => document.body}
  >
    {children}
  </Tooltip>
);

export default RailTooltip;
