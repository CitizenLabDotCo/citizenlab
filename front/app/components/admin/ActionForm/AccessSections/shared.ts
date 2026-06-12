import { CSSProperties } from 'react';

import { colors } from '@citizenlab/cl2-component-library';

import { Changes, IPhasePermissionData } from '../types';

// Common props for both access-section variants.
export interface AccessSectionProps {
  permission: IPhasePermissionData;
  // Whether the "Anyone" option is offered (derived from
  // `permitted_by_everyone_allowed` by the parent).
  showAnyone: boolean;
  onChange: (changes: Changes) => void;
}

// Inline styling for the small text-button affordances.
export const linkStyle: CSSProperties = {
  cursor: 'pointer',
  textDecoration: 'underline',
  color: colors.teal700,
};
