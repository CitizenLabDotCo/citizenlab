import React from 'react';

import {
  Box,
  bo,
  colors,
  defaultStyles,
} from '@citizenlab/cl2-component-library';

import Link, { typedStyled } from 'utils/cl-router/Link';

import { PhaseView } from './usePhaseViews';

// The active segment is styled off aria-current so its state stays in one place.
const Segment = typedStyled(Link)`
  display: inline-flex;
  align-items: center;
  padding: 5px 14px;
  border-radius: ${bo.borderRadius};
  font-size: ${bo.controlFontSize}px;
  font-weight: 500;
  white-space: nowrap;
  color: ${colors.coolGrey700};

  &:hover {
    color: ${colors.textPrimary};
  }

  &[aria-current='page'] {
    background: ${colors.white};
    box-shadow: ${defaultStyles.boxShadow};
    color: ${colors.textPrimary};
  }
`;

interface Props {
  views: PhaseView[];
  activeView: string;
  projectId: string;
  phaseId: string;
}

const ViewSwitch = ({ views, activeView, projectId, phaseId }: Props) => {
  if (views.length < 2) return null;

  return (
    <Box
      display="inline-flex"
      alignItems="center"
      gap="2px"
      p="3px"
      borderRadius={bo.borderRadius}
      background={colors.grey100}
    >
      {views.map((view) => (
        <Segment
          key={view.key}
          to={view.to}
          params={{ projectId, phaseId }}
          aria-current={view.key === activeView ? 'page' : undefined}
        >
          {view.label}
        </Segment>
      ))}
    </Box>
  );
};

export default ViewSwitch;
