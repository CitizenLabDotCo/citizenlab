import React, { ReactNode } from 'react';

import { IPhasePermissionAction } from 'api/permissions/types';

import PhaseActionAccess from './PhaseActionAccess';
import styles from './ToggleActionAccess.module.css';
import 'design-system/tokens.css';

interface Props {
  phaseId: string;
  action: IPhasePermissionAction;
  children: ReactNode;
}

const ToggleActionAccess = ({ phaseId, action, children }: Props) => (
  <div className={styles.row}>
    {children}
    <PhaseActionAccess phaseId={phaseId} action={action} />
  </div>
);

export default ToggleActionAccess;
