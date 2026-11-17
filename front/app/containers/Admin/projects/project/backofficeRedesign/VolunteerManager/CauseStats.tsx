import React from 'react';

import { ICauseData } from 'api/causes/types';

import useLocalize from 'hooks/useLocalize';

import StatRow from 'design-system/StatRow';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import styles from './VolunteerManager.module.css';
import 'design-system/tokens.css';

interface Props {
  causes: ICauseData[];
  selectedCauseIds: string[];
  onToggleCause: (causeId: string) => void;
}

// The phase total, then a row per cause. A cause with volunteers filters the
// list to them; a second click clears that filter.
const CauseStats = ({ causes, selectedCauseIds, onToggleCause }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const total = causes.reduce(
    (sum, cause) => sum + cause.attributes.volunteers_count,
    0
  );
  const onlySelected = selectedCauseIds.length === 1 && selectedCauseIds[0];

  return (
    <div className={styles.stats}>
      <StatRow label={formatMessage(messages.volunteers)} value={total} />
      {causes.map((cause) => {
        const count = cause.attributes.volunteers_count;
        const label = localize(cause.attributes.title_multiloc);

        if (count === 0) {
          return <StatRow key={cause.id} label={label} value={count} />;
        }

        return (
          <StatRow
            key={cause.id}
            label={label}
            value={count}
            onPress={() => onToggleCause(cause.id)}
            isPressed={onlySelected === cause.id}
          />
        );
      })}
    </div>
  );
};

export default CauseStats;
