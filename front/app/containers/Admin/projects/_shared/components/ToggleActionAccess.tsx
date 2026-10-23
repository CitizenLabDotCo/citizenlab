import React, { ReactNode } from 'react';

import { Box, bo, colors, fontSizes } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { IPhasePermissionAction } from 'api/permissions/types';

import PhaseActionAccess from './PhaseActionAccess';

// The toggle brings its own label; in the panel row it reads at control size.
const Row = styled(Box)`
  label {
    font-size: ${bo.controlFontSize}px;
    color: ${bo.colors.textHeadingStrong};
  }

  label + span {
    font-size: ${fontSizes.xs}px;
    color: ${colors.coolGrey600};
  }
`;

interface Props {
  phaseId: string;
  action: IPhasePermissionAction;
  /** The action's toggle, shown on the left of the row. */
  children: ReactNode;
}

const ToggleActionAccess = ({ phaseId, action, children }: Props) => (
  <Row
    display="flex"
    alignItems="center"
    justifyContent="space-between"
    gap="12px"
    minHeight="36px"
  >
    {children}
    <PhaseActionAccess phaseId={phaseId} action={action} />
  </Row>
);

export default ToggleActionAccess;
