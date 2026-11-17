import React from 'react';

import Switch from 'design-system/Switch';

import { IPhaseData } from 'api/phases/types';
import useUpdatePhase from 'api/phases/useUpdatePhase';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

import AutoShareNotice from './AutoShareNotice';
import Card from './Card';
import styles from './SideColumn.module.css';

const TOGGLE_ID = 'auto-share-results';

interface Props {
  phase: IPhaseData;
}

const AutoShareResults = ({ phase }: Props) => {
  const { formatMessage } = useIntl();
  const { mutate: updatePhase, isPending } = useUpdatePhase();
  const enabled = !!phase.attributes.autoshare_results_enabled;

  return (
    <Card fillHeight>
      <div className={styles.autoShare}>
        {enabled && <AutoShareNotice phase={phase} />}
        <div className={styles.switchRow}>
          <Switch
            id={TOGGLE_ID}
            size={26}
            isSelected={enabled}
            isDisabled={isPending}
            onChange={() =>
              updatePhase({
                phaseId: phase.id,
                autoshare_results_enabled: !enabled,
              })
            }
          >
            {formatMessage(messages.autoShareResults)}
          </Switch>
        </div>
      </div>
    </Card>
  );
};

export default AutoShareResults;
