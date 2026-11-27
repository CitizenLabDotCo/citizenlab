import React from 'react';

import Icon from 'design-system/Icon';

import { IPhasePermissionAction } from 'api/permissions/types';

import { MessageDescriptor, useIntl } from 'utils/cl-intl';

import styles from './PhaseActionAccessRow.module.css';
import ToggleActionAccess from './ToggleActionAccess';
import useInputsNoun from './useInputsNoun';
import 'design-system/tokens.css';

export interface AccessOnlyAction {
  action: IPhasePermissionAction;
  label: MessageDescriptor;
}

interface Props extends AccessOnlyAction {
  phaseId: string;
}

const PhaseActionAccessRow = ({ phaseId, action, label }: Props) => {
  const { formatMessage } = useIntl();
  const inputs = useInputsNoun({ phaseId });

  return (
    <ToggleActionAccess phaseId={phaseId} action={action}>
      <span className={styles.row}>
        {/* Sits where a 26 px switch sits in the toggle rows above. */}
        <span className={styles.iconBox}>
          <Icon name="check-14" className={styles.icon} />
        </span>
        <span className={styles.label}>{formatMessage(label, { inputs })}</span>
      </span>
    </ToggleActionAccess>
  );
};

export default PhaseActionAccessRow;
