import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';

import Link, { typedStyled } from 'utils/cl-router/Link';

import { PhaseView } from './usePhaseViews';

// A pill, so the radius is a shape rather than the card radius in
// stylingConsts. The active segment is styled off aria-current so the state
// lives in one place for both assistive tech and the eye.
const Segment = typedStyled(Link)`
  display: inline-flex;
  align-items: center;
  padding: 5px 14px;
  border-radius: 999px;
  font-size: 12.5px;
  font-weight: 600;
  white-space: nowrap;
  color: ${colors.coolGrey600};

  &:hover {
    color: ${colors.textPrimary};
  }

  &[aria-current='page'] {
    background: ${colors.white};
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
      borderRadius="999px"
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
