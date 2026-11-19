import React from 'react';

import Disclosure from 'design-system/Disclosure';
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
        <Disclosure
          header="static"
          title={formatMessage(messages.autoShareResults)}
          actions={
            <Switch
              id={TOGGLE_ID}
              size={26}
              aria-label={formatMessage(messages.autoShareResults)}
              isSelected={enabled}
              isDisabled={isPending}
              onChange={() =>
                updatePhase({
                  phaseId: phase.id,
                  autoshare_results_enabled: !enabled,
                })
              }
            />
          }
        />
      </div>
    </Card>
  );
};

export default AutoShareResults;
